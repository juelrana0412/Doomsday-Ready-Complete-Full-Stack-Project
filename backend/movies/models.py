from django.db import models


class Movie(models.Model):

    title = models.CharField(
        max_length=255,
        unique=True
    )

    release_year = models.PositiveIntegerField()

    runtime = models.PositiveIntegerField()

    watched = models.BooleanField(default=False)

    prerequisites = models.ManyToManyField(
        'self',
        symmetrical=False,
        blank=True,
        related_name='required_by'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['release_year', 'title']

    def __str__(self):
        return self.title