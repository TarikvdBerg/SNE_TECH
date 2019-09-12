from django.db import models
import uuid


# Create your models here.


class Subscription(models.Model):
    code = models.CharField(10, primary_key=True)
    name = models.CharField(45)
    storage = models.BigIntegerField()


class Role(models.Model):
    code = models.CharField(10, primary_key=True)
    name = models.CharField(45)


class User(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    customer_number = models.IntegerField()
    name = models.CharField(50)
    email = models.EmailField(50)
    new_email = models.EmailField(50)
    password = models.CharField(64)
    active = models.BooleanField(default=False)
    verified = models.BooleanField(default=False)
    subscription = models.ForeignKey(Subscription)
    role = models.ForeignKey(Role)
    verification_key = models.CharField(32)
    passwd_key = models.CharField(32)


class Folder(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(64)
    parent = models.ForeignKey("self")


class File(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(64)
    parent = models.ForeignKey(Folder)


class FolderACL(models.Model):
    user_uuid = models.ForeignKey(User)
    folder_uuid = models.ForeignKey(Folder)
    is_owner = models.BooleanField(default=False)
    can_edit = models.BooleanField(default=False)
    can_see = models.BooleanField(default=True)
    can_change_files = models.BooleanField(default=False)


class FileACL(models.Model):
    user_uuid = models.ForeignKey(User)
    file_uuid = models.ForeignKey(File)
    is_owner = models.BooleanField(default=False)
    can_edit = models.BooleanField(default=False)
