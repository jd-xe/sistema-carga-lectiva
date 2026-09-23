from pydantic import BaseModel

class LoginRequest(BaseModel):
    usuario: str
    password: str