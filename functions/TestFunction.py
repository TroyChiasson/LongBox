from firebase_functions import https_fn

@https_fn.on_request()
def my_function(req: https_fn.Request) -> https_fn.Response:
    # Your function logic here
    return https_fn.Response("Hello from my function!")
