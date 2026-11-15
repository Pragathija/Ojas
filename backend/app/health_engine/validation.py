from typing import Tuple, List, Dict, Any

class ValidationErrorItem:
    def __init__(self, field: str, message: str, value: Any):
        self.field = field
        self.message = message
        self.value = value

    def to_dict(self) -> Dict[str, Any]:
        return {
            "field": self.field,
            "message": self.message,
            "value": self.value
        }


def validate_physiological_ranges(data: Dict[str, Any]) -> Tuple[bool, List[Dict[str, Any]]]:
    """
    Validate incoming biometric measurements against physiologically plausible limits.
    Returns (is_valid, list_of_errors).
    """
    errors: List[Dict[str, Any]] = []

    # Heart Rate
    hr = data.get("heart_rate")
    if hr is not None and not (30 <= hr <= 250):
        errors.append(ValidationErrorItem("heart_rate", "Heart rate must be between 30 and 250 BPM", hr).to_dict())

    # Blood Oxygen
    spo2 = data.get("blood_oxygen")
    if spo2 is not None and not (50.0 <= spo2 <= 100.0):
        errors.append(ValidationErrorItem("blood_oxygen", "Blood oxygen (SpO2) must be between 50.0% and 100.0%", spo2).to_dict())

    # Blood Pressure
    sys_bp = data.get("systolic_bp")
    dia_bp = data.get("diastolic_bp")
    if sys_bp is not None and not (50 <= sys_bp <= 260):
        errors.append(ValidationErrorItem("systolic_bp", "Systolic BP must be between 50 and 260 mmHg", sys_bp).to_dict())
    if dia_bp is not None and not (30 <= dia_bp <= 160):
        errors.append(ValidationErrorItem("diastolic_bp", "Diastolic BP must be between 30 and 160 mmHg", dia_bp).to_dict())
    if sys_bp is not None and dia_bp is not None and sys_bp <= dia_bp:
        errors.append(ValidationErrorItem("systolic_bp", "Systolic BP must be greater than Diastolic BP", sys_bp).to_dict())

    # Body Temperature
    temp = data.get("body_temperature")
    if temp is not None and not (30.0 <= temp <= 45.0):
        errors.append(ValidationErrorItem("body_temperature", "Body temperature must be between 30.0°C and 45.0°C", temp).to_dict())

    # Sleep Duration
    sleep_dur = data.get("sleep_duration")
    if sleep_dur is not None and not (0.0 <= sleep_dur <= 24.0):
        errors.append(ValidationErrorItem("sleep_duration", "Sleep duration must be between 0.0 and 24.0 hours", sleep_dur).to_dict())

    # Sleep Quality
    sleep_q = data.get("sleep_quality")
    if sleep_q is not None and not (0.0 <= sleep_q <= 100.0):
        errors.append(ValidationErrorItem("sleep_quality", "Sleep quality score must be between 0 and 100", sleep_q).to_dict())

    # Stress Level
    stress = data.get("stress_level")
    if stress is not None and not (0.0 <= stress <= 100.0):
        errors.append(ValidationErrorItem("stress_level", "Stress level score must be between 0 and 100", stress).to_dict())

    # Fatigue
    fatigue = data.get("fatigue_level")
    if fatigue is not None and not (1.0 <= fatigue <= 10.0):
        errors.append(ValidationErrorItem("fatigue_level", "Fatigue scale must be between 1.0 and 10.0", fatigue).to_dict())

    return len(errors) == 0, errors
