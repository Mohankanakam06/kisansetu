import pytest
from backend.services.pricing_engine import (
    STLAttLSTMPredictor,
    DynamicMarginEngine,
    get_dynamic_ticker_stream,
)

def test_stl_attlstm_prediction_accuracy_and_bounds():
    predictor = STLAttLSTMPredictor()
    result = predictor.predict_price(crop="Tomato", base_price=22.0, horizon_days=7)

    assert "predicted_price" in result
    assert "confidence_score" in result
    assert result["confidence_score"] >= 0.985
    assert 10.0 <= result["predicted_price"] <= 50.0
    assert "decomposition" in result
    assert "trend" in result["decomposition"]
    assert "seasonality" in result["decomposition"]
    assert "attention_weights" in result
    assert len(result["attention_weights"]) == 7

def test_stl_attlstm_prediction_horizons():
    predictor = STLAttLSTMPredictor()
    res_1d = predictor.predict_price(crop="Onion", base_price=28.0, horizon_days=1)
    res_14d = predictor.predict_price(crop="Onion", base_price=28.0, horizon_days=14)

    assert res_1d["horizon_days"] == 1
    assert res_14d["horizon_days"] == 14
    assert res_1d["predicted_price"] > 0
    assert res_14d["predicted_price"] > 0

def test_dynamic_margin_engine_factors_and_uplift():
    engine = DynamicMarginEngine()
    margin_res = engine.compute_dynamic_margin(
        crop="Tomato",
        quantity_kg=2400.0,
        quality_grade="A",
        quality_score=94.0,
        distance_km=26.4,
        base_mandi_price=22.0
    )

    assert "recommended_price_kg" in margin_res
    assert "farmer_payout_kg" in margin_res
    assert "farmer_uplift_pct" in margin_res
    assert margin_res["farmer_uplift_pct"] > 0
    assert "factors" in margin_res
    assert "quality_premium" in margin_res["factors"]
    assert "volume_efficiency" in margin_res["factors"]
    assert "logistics_saving" in margin_res["factors"]
    assert "perishability_penalty" in margin_res["factors"]
    assert margin_res["factors"]["quality_premium"]["multiplier"] > 1.0

def test_dynamic_margin_engine_grade_c_discount():
    engine = DynamicMarginEngine()
    margin_res = engine.compute_dynamic_margin(
        crop="Tomato",
        quantity_kg=500.0,
        quality_grade="C",
        quality_score=62.0,
        distance_km=10.0,
        base_mandi_price=22.0
    )
    # Grade C should not receive grade A premium
    assert margin_res["factors"]["quality_premium"]["multiplier"] < 1.0

def test_dynamic_ticker_stream_generation():
    items = get_dynamic_ticker_stream()
    assert len(items) >= 6
    for item in items:
        assert "crop_type" in item
        assert "price_per_kg" in item
        assert "predicted_trend_7d" in item
        assert "confidence" in item
        assert "mandi" in item
        assert "change_24h_pct" in item
