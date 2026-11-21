from django.db import transaction
from django.db.models import Prefetch

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .models import Movie
from .serializers import MovieSerializer
from .services import get_rewatch_order


class MovieViewSet(viewsets.ModelViewSet):

    queryset = Movie.objects.prefetch_related(
        'prerequisites'
    ).all()

    serializer_class = MovieSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):

        return super().create(request, *args, **kwargs)

    @transaction.atomic
    def partial_update(self, request, *args, **kwargs):

        return super().partial_update(request, *args, **kwargs)

    @action(
        detail=True,
        methods=['get'],
        url_path='rewatch-order'
    )
    def rewatch_order(self, request, pk=None):

        target = self.get_object()

        movies = get_rewatch_order(target)

        watched_count = sum(
            1 for movie in movies if movie.watched
        )

        unwatched_runtime = sum(
            movie.runtime
            for movie in movies
            if not movie.watched
        )

        movie_data = [
            {
                "id": movie.id,
                "title": movie.title,
                "release_year": movie.release_year,
                "runtime": movie.runtime,
                "watched": movie.watched
            }
            for movie in movies
        ]

        return Response({
            "target": target.title,
            "total_movies": len(movies),
            "watched_count": watched_count,
            "unwatched_count": len(movies) - watched_count,
            "remaining_runtime": unwatched_runtime,
            "movies": movie_data
        })