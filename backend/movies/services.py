
from rest_framework.exceptions import APIException

from .models import Movie


class CircularDependencyError(APIException):
    status_code = 409
    default_detail = "Circular movie dependency detected."
    default_code = "CIRCULAR_DEPENDENCY"


# FEATURE 1A: Circular Dependency Validation
def validate_no_cycle(movie, new_prerequisites):

    target_id = movie.id if movie else None

    visited = set()

    def dfs(current_id):

        # Reaching the original movie means a cycle exists
        if current_id == target_id:
            raise CircularDependencyError()

        if current_id in visited:
            return

        visited.add(current_id)

        try:
            current = Movie.objects.get(id=current_id)
        except Movie.DoesNotExist:
            return

        for prerequisite_id in current.prerequisites.values_list(
            'id', flat=True
        ):
            dfs(prerequisite_id)

    for prerequisite in new_prerequisites:

        if target_id is not None and prerequisite.id == target_id:
            raise CircularDependencyError()

        dfs(prerequisite.id)


# FEATURE 1B: Rewatch Order using DFS
def get_rewatch_order(target):

    visited = set()
    visiting = set()
    result = []

    def dfs(movie):

        # Detect circular dependency
        if movie.id in visiting:
            raise CircularDependencyError()

        # Avoid duplicate movies
        if movie.id in visited:
            return

        visiting.add(movie.id)

        # Visit prerequisites first
        prerequisites = movie.prerequisites.all()

        for prerequisite in prerequisites:
            dfs(prerequisite)

        visiting.remove(movie.id)
        visited.add(movie.id)

        # Exclude target movie
        if movie.id != target.id:
            result.append(movie)

    # Start from target prerequisites
    for prerequisite in target.prerequisites.all():
        dfs(prerequisite)

    return result
