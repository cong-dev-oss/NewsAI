from app.services.signal_ingestion_service import SignalIngestionService


def test_language_and_country_are_trimmed_to_schema_limit() -> None:
    rows = SignalIngestionService.normalize_items(
        source_type="newsdata",
        topic_name="Kinh te",
        items=[
            {
                "title": "Sample",
                "description": "Example",
                "url": "https://example.com",
                "language": "very-long-language-name",
                "country": ["united states of america"],
            }
        ],
    )

    assert len(rows) == 1
    assert rows[0]["language"] == "very-long-langua"
    assert rows[0]["country"] == "united states of"


if __name__ == "__main__":
    test_language_and_country_are_trimmed_to_schema_limit()
    print("signal normalization limit checks passed")
