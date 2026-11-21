from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import Cinema
from .serializers import CinemaSerializer
from .services import calculate_booking


class CinemaViewSet(viewsets.ModelViewSet):

    queryset = Cinema.objects.prefetch_related('bundles').all()

    serializer_class = CinemaSerializer

    @action(
        detail=True,
        methods=['get'],
        url_path='booking'
    )
    def booking(self, request, pk=None):

        cinema = self.get_object()

        group_size = request.query_params.get('groupSize')

        if group_size is None:
            raise ValidationError({
                "groupSize": "This parameter is required."
            })

        try:
            group_size = int(group_size)
        except (ValueError, TypeError):
            raise ValidationError({
                "groupSize": "Group size must be an integer."
            })

        if not 1 <= group_size <= 10000:
            raise ValidationError({
                "groupSize": "Group size must be between 1 and 10000."
            })

        bundle_sizes = list(
            cinema.bundles.values_list('size', flat=True)
        )

        result = calculate_booking(
            bundle_sizes,
            group_size
        )

        result['cinema'] = cinema.name
        result['group_size'] = group_size

        return Response(result)