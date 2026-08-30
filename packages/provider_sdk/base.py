from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from dataclasses import dataclass
from typing import Any

from apps.api.app.domain import NormalizedResult, ProjectContext, QueryTemplate, SourceClass


class ProviderError(RuntimeError):
    pass


@dataclass(frozen=True)
class ProviderCapabilities:
    name: str
    source_classes: frozenset[SourceClass]
    operations: frozenset[str]
    requires_auth: bool
    requests_per_minute: int
    cost_model: str
    pagination_model: str
    evidence_limitations: str
    retention_limitations: str
    version: str


class ProviderAdapter(ABC):
    @abstractmethod
    def get_capabilities(self) -> ProviderCapabilities: ...
    @abstractmethod
    async def validate_credentials(self) -> bool: ...
    @abstractmethod
    def validate_scope(self, project: ProjectContext, target: str) -> bool: ...
    @abstractmethod
    def build_query(self, template: QueryTemplate, inputs: dict[str, Any]) -> str: ...
    @abstractmethod
    async def execute_query(self, query: str) -> dict[str, Any]: ...
    @abstractmethod
    async def paginate(self, response: dict[str, Any]) -> AsyncIterator[dict[str, Any]]: ...
    @abstractmethod
    def normalize_result(self, response: dict[str, Any]) -> NormalizedResult: ...
    @abstractmethod
    def estimate_cost(self, query: str) -> float: ...
    @abstractmethod
    async def get_rate_limit_state(self) -> dict[str, Any]: ...
    @abstractmethod
    async def health_check(self) -> bool: ...
