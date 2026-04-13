from typing import Any, Dict, List


class SignalScoringService:
    TITLE_BONUS = 20
    EXCERPT_BONUS = 10
    URL_BONUS = 5

    @classmethod
    def score_signal(cls, signal: Dict[str, Any], priority_weight: int) -> int:
        score = int(priority_weight or 0)
        if signal.get("title"):
            score += cls.TITLE_BONUS
        if signal.get("excerpt"):
            score += cls.EXCERPT_BONUS
        if signal.get("original_url"):
            score += cls.URL_BONUS
        return score

    @classmethod
    def rank_signals(
        cls, signals: List[Dict[str, Any]], priority_weight: int, pick_limit: int
    ) -> List[Dict[str, Any]]:
        scored_signals: List[Dict[str, Any]] = []
        for signal in signals:
            scored = dict(signal)
            scored["signal_score"] = cls.score_signal(scored, priority_weight)
            scored_signals.append(scored)

        ranked = sorted(scored_signals, key=lambda item: item["signal_score"], reverse=True)
        if pick_limit <= 0:
            return []
        return ranked[:pick_limit]
