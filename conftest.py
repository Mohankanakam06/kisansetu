import pytest
from unittest.mock import patch
from tests.test_e2e_flow import get_mock_conn

@pytest.fixture(autouse=True)
def mock_db_connection():
    mock_ors = {
        "type": "FeatureCollection",
        "features": [{
            "properties": {"summary": {"distance": 12500, "duration": 1800}},
            "geometry": {"type": "LineString", "coordinates": [[72.8618, 22.6939], [72.8700, 22.7000]]}
        }]
    }
    with patch("psycopg2.connect", side_effect=lambda *args, **kwargs: get_mock_conn()), \
         patch("backend.db.get_conn", side_effect=get_mock_conn), \
         patch("ai.agents.farmer_interface.get_conn", side_effect=get_mock_conn), \
         patch("ai.agents.aggregations.get_conn", side_effect=get_mock_conn), \
         patch("ai.agents.quality_grading.get_conn", side_effect=get_mock_conn), \
         patch("ai.agents.routing.get_conn", side_effect=get_mock_conn), \
         patch("ai.agents.routing._call_ors_directions", return_value=mock_ors), \
         patch("ai.agents.settlement.get_conn", side_effect=get_mock_conn):
        yield
