
from rest_framework import serializers
from .models import Movie
from .services import validate_no_cycle


class MovieSerializer(serializers.ModelSerializer):

    prerequisites = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Movie.objects.all(),
        required=False
    )

    class Meta:
        model = Movie

        fields = [
            "id",
            "title",
            "release_year",
            "runtime",
            "prerequisites",
            "watched",
            "created_at",
            "updated_at"
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at"
        ]

    # Runtime validation
    def validate_runtime(self, value):

        if not 1 <= value <= 300:
            raise serializers.ValidationError(
                "Runtime must be between 1 and 300 minutes."
            )

        return value

    # Circular dependency validation
    def validate_prerequisites(self, value):

        movie = self.instance

        validate_no_cycle(movie, value)

        return value

    # Watched status and prerequisite validation
    def validate(self, attrs):

        instance = self.instance

        # Determine final watched status
        watched = attrs.get(
            "watched",
            instance.watched if instance else False
        )

        # Determine final prerequisites
        if "prerequisites" in attrs:
            prerequisites = attrs["prerequisites"]

        elif instance:
            prerequisites = list(
                instance.prerequisites.all()
            )

        else:
            prerequisites = []

        # Cannot mark watched if prerequisites are incomplete
        if watched:

            incomplete = [
                movie.title
                for movie in prerequisites
                if not movie.watched
            ]

            if incomplete:
                raise serializers.ValidationError({
                    "watched": (
                        "You must watch these prerequisite "
                        "movies first: "
                        + ", ".join(incomplete)
                    )
                })

        # Cannot unwatch a prerequisite if a dependent movie
        # is already watched
        if instance and "watched" in attrs and not watched:

            watched_dependents = instance.dependent_movies.filter(
                watched=True
            )

            if watched_dependents.exists():

                titles = list(
                    watched_dependents.values_list(
                        "title",
                        flat=True
                    )
                )

                raise serializers.ValidationError({
                    "watched": (
                        "Cannot mark this movie as unwatched "
                        "because these dependent movies are "
                        "already watched: "
                        + ", ".join(titles)
                    )
                })

        return attrs

    # Create movie
    def create(self, validated_data):

        prerequisites = validated_data.pop(
            "prerequisites", []
        )

        movie = Movie.objects.create(**validated_data)

        movie.prerequisites.set(prerequisites)

        return movie

    # Update movie
    def update(self, instance, validated_data):

        prerequisites = validated_data.pop(
            "prerequisites", None
        )

        for key, value in validated_data.items():
            setattr(instance, key, value)

        instance.save()

        if prerequisites is not None:
            instance.prerequisites.set(prerequisites)

        return instance
