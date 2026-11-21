from django.db import models


class Cinema(models.Model):

    name = models.CharField(
        max_length=255,
        unique=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class CinemaBundle(models.Model):

    cinema = models.ForeignKey(
        Cinema,
        on_delete=models.CASCADE,
        related_name='bundles'
    )

    size = models.PositiveIntegerField()

    class Meta:
        ordering = ['size']

        constraints = [
            models.UniqueConstraint(
                fields=['cinema', 'size'],
                name='unique_cinema_bundle_size'
            )
        ]

    def __str__(self):
        return f"{self.cinema.name} - {self.size} seats"