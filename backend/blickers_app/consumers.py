import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import ChatRoom, Message, User

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"chat_{self.room_id}"
        
        # Vérifier que l'utilisateur a bien accès à cette salle
        if not await self.user_in_room():
            await self.close()
            return
        
        # Joindre le groupe de chat
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Mettre à jour le statut "en ligne" de l'utilisateur
        await self.set_user_online(True)
        
        await self.accept()
        
        # Informer les autres utilisateurs que cet utilisateur est connecté
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "user_status",
                "user_id": self.user.id,
                "status": "online"
            }
        )

    async def disconnect(self, close_code):
        # Quitter le groupe de chat
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        # Mettre à jour le statut "hors ligne" de l'utilisateur
        await self.set_user_online(False)
        
        # Informer les autres utilisateurs que cet utilisateur est hors ligne
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "user_status",
                "user_id": self.user.id,
                "status": "offline"
            }
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get("type", "message")
        
        if message_type == "message":
            message = text_data_json["message"]
            
            # Enregistrer le message dans la base de données
            message_obj = await self.save_message(message)
            
            # Envoyer le message à tous les membres du groupe
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message,
                    "username": self.user.username,
                    "user_id": self.user.id,
                    "timestamp": message_obj["timestamp"],
                    "message_id": message_obj["id"]
                }
            )
        
        elif message_type == "typing":
            status = text_data_json["status"]  # "typing" ou "stopped_typing"
            
            # Informer les autres que l'utilisateur est en train d'écrire
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "typing_status",
                    "user_id": self.user.id,
                    "username": self.user.username,
                    "status": status
                }
            )
        
        elif message_type == "read_receipt":
            message_id = text_data_json["message_id"]
            
            # Marquer le message comme lu
            await self.mark_message_read(message_id)
            
            # Informer les autres que le message a été lu
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "read_receipt",
                    "message_id": message_id,
                    "user_id": self.user.id
                }
            )

    async def chat_message(self, event):
        # Envoyer le message au client WebSocket
        await self.send(text_data=json.dumps({
            "type": "message",
            "message": event["message"],
            "username": event["username"],
            "user_id": event["user_id"],
            "timestamp": event["timestamp"],
            "message_id": event["message_id"]
        }))

    async def typing_status(self, event):
        # Envoyer le statut de frappe au client WebSocket
        await self.send(text_data=json.dumps({
            "type": "typing",
            "user_id": event["user_id"],
            "username": event["username"],
            "status": event["status"]
        }))

    async def user_status(self, event):
        # Envoyer le statut de l'utilisateur au client WebSocket
        await self.send(text_data=json.dumps({
            "type": "user_status",
            "user_id": event["user_id"],
            "status": event["status"]
        }))

    async def read_receipt(self, event):
        # Envoyer l'accusé de lecture au client WebSocket
        await self.send(text_data=json.dumps({
            "type": "read_receipt",
            "message_id": event["message_id"],
            "user_id": event["user_id"]
        }))

    @database_sync_to_async
    def user_in_room(self):
        """Vérifier que l'utilisateur est bien participant à cette salle de chat"""
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            return room.participants.filter(id=self.user.id).exists()
        except ChatRoom.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content):
        """Enregistrer un nouveau message dans la base de données"""
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            message = Message.objects.create(
                room=room,
                sender=self.user,
                content=content,
                is_read=False
            )
            # Mettre à jour le timestamp de la salle
            room.updated_at = timezone.now()
            room.save()
            
            return {
                "id": str(message.id),
                "timestamp": message.timestamp.strftime("%H:%M %d/%m/%Y")
            }
        except ChatRoom.DoesNotExist:
            return None

    @database_sync_to_async
    def mark_message_read(self, message_id):
        """Marquer un message comme lu"""
        try:
            message = Message.objects.get(id=message_id)
            if message.sender != self.user:  # Ne pas marquer ses propres messages
                message.is_read = True
                message.read_by.add(self.user)
                message.save()
            return True
        except Message.DoesNotExist:
            return False

    @database_sync_to_async
    def set_user_online(self, is_online):
        """Mettre à jour le statut en ligne de l'utilisateur"""
        try:
            user = User.objects.get(id=self.user.id)
            user.is_online = is_online
            if not is_online:
                user.last_online = timezone.now()
            user.save()
            return True
        except User.DoesNotExist:
            return False


class NotificationConsumer(AsyncWebsocketConsumer):
    """Consumer pour les notifications en temps réel"""
    
    async def connect(self):
        self.user = self.scope["user"]
        self.notification_group_name = f"notifications_{self.user.id}"
        
        # Joindre le groupe de notifications personnelles
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Quitter le groupe de notifications
        await self.channel_layer.group_discard(
            self.notification_group_name,
            self.channel_name
        )
    
    async def notification(self, event):
        """Envoyer une notification au client WebSocket"""
        await self.send(text_data=json.dumps({
            "type": "notification",
            "notification_id": event["notification_id"],
            "title": event["title"],
            "message": event["message"],
            "notification_type": event["notification_type"],
            "created_at": event["created_at"],
            "link": event.get("link", "")
        }))