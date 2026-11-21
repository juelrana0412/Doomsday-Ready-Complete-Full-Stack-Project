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
            'id',
            'title',
            'release_year',
            'runtime',
            'prerequisites',
            'watched',
            'created_at',
            'updated_at'
        ]

        read_only_fields = [
            'id',
            'created_at',
            'updated_at'
        ]

    def validate_runtime(self, value):

        if not 1 <= value <= 300:
            raise serializers.ValidationError(
                "Runtime must be between 1 and 300 minutes."
            )

        return value

    def validate_prerequisites(self, value):

        movie = self.instance

        validate_no_cycle(movie, value)

        return value

    def create(self, validated_data):

        prerequisites = validated_data.pop(
            'prerequisites', []
        )

        movie = Movie.objects.create(**validated_data)

        movie.prerequisites.set(prerequisites)

        return movie

    def update(self, instance, validated_data):

        prerequisites = validated_data.pop(
            'prerequisites', None
        )

        for key, value in validated_data.items():
            setattr(instance, key, value)

        instance.save()

        if prerequisites is not None:
            instance.prerequisites.set(prerequisites)

        return instance