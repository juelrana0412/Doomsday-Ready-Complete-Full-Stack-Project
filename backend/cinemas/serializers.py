from rest_framework import serializers
from django.db import transaction

from .models import Cinema, CinemaBundle


class CinemaSerializer(serializers.ModelSerializer):

    bundle_sizes = serializers.ListField(
        child=serializers.IntegerField(
            min_value=1,
            max_value=500
        ),
        write_only=True,
        min_length=1,
        max_length=10
    )

    class Meta:
        model = Cinema

        fields = [
            'id',
            'name',
            'bundle_sizes',
            'created_at'
        ]

        read_only_fields = [
            'id',
            'created_at'
        ]

    def validate_bundle_sizes(self, value):

        if len(value) != len(set(value)):
            raise serializers.ValidationError(
                "Bundle sizes must be unique."
            )

        return value

    @transaction.atomic
    def create(self, validated_data):

        bundle_sizes = validated_data.pop('bundle_sizes')

        cinema = Cinema.objects.create(**validated_data)

        CinemaBundle.objects.bulk_create([
            CinemaBundle(
                cinema=cinema,
                size=size
            )
            for size in bundle_sizes
        ])

        return cinema

    def to_representation(self, instance):

        data = super().to_representation(instance)

        data['bundle_sizes'] = list(
            instance.bundles.values_list('size', flat=True)
        )

        return data