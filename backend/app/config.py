from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://storycards:storycards@db:5432/storycards"

    model_config = {"env_file": ".env"}


settings = Settings()
