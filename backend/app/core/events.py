import asyncio
import inspect
from collections import defaultdict
from typing import Any, Callable, DefaultDict, List, Optional


Handler = Callable[[Any], Any]


class EventBus:
    """
    Bus de eventos minimalista para desacoplar productores y observadores.
    Soporta handlers sincrónicos y async.
    """

    def __init__(self) -> None:
        self._subs: DefaultDict[str, List[Handler]] = defaultdict(list)

    def subscribe(self, event: str, handler: Handler) -> None:
        self._subs[event].append(handler)

    async def publish(self, event: str, payload: Optional[Any] = None) -> None:
        for handler in self._subs.get(event, []):
            result = handler(payload)
            if inspect.isawaitable(result):
                await result

    def publish_background(self, background_tasks, event: str, payload: Optional[Any] = None) -> None:
        """
        Encola la publicación en BackgroundTasks de FastAPI para no bloquear el request.
        """
        background_tasks.add_task(self._run_async, event, payload)

    @staticmethod
    def _run_async(event: str, payload: Optional[Any]) -> None:
        asyncio.run(event_bus.publish(event, payload))


event_bus = EventBus()
