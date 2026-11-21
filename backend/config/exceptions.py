from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):

    response = exception_handler(exc, context)

    if response is not None:

        code = getattr(exc, 'default_code', None)

        if code == 'CIRCULAR_DEPENDENCY':

            response.data = {
                "code": "CIRCULAR_DEPENDENCY",
                "detail": str(exc.detail)
            }

    return response