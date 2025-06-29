# forms.py
from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.core.exceptions import ValidationError
from .models import User

class LoginForm(AuthenticationForm):
    username = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'form-input',
            'placeholder': 'Nom d\'utilisateur ou email'
        })
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-input',
            'placeholder': 'Mot de passe'
        })
    )

    error_messages = {
        'invalid_login': "Identifiants incorrects. Veuillez réessayer.",
        'inactive': "Ce compte est inactif.",
    }

class RegisterForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'form-input',
            'placeholder': 'Adresse email'
        })
    )
    first_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-input',
            'placeholder': 'Prénom'
        })
    )
    last_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-input',
            'placeholder': 'Nom'
        })
    )
    
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password1', 'password2')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({'class': 'form-input', 'placeholder': 'Nom d\'utilisateur'})
        self.fields['password1'].widget.attrs.update({'class': 'form-input', 'placeholder': 'Mot de passe'})
        self.fields['password2'].widget.attrs.update({'class': 'form-input', 'placeholder': 'Confirmation du mot de passe'})
    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError("Cette adresse email est déjà utilisée.")
        return email