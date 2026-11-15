"""
NASA BRSMAct Data Dictionary.

Defines schemas, data types, physical units, valid ranges, and operational
interpretations for UTMB Bedrest Campaign 1 Actigraphy telemetry.
"""

from dataclasses import dataclass
from typing import Dict, List, Optional, Any


@dataclass(frozen=True)
class FieldDefinition:
    field_name: str
    source_column_primary: str
    source_column_query: str
    data_type: str
    raw_format_unit: str
    normalized_unit: str
    valid_range: str
    description: str
    is_required: bool
    notes: str


DATA_DICTIONARY: Dict[str, FieldDefinition] = {
    "subject": FieldDefinition(
        field_name="subject",
        source_column_primary="Subject",
        source_column_query="Subject",
        data_type="str",
        raw_format_unit="String code",
        normalized_unit="Categorical Identifier",
        valid_range="{'C1G0001', 'C1G0002', 'C1G0003'}",
        description="De-identified subject identifier code for Campaign 1 analog test subjects.",
        is_required=True,
        notes="Anonymized ID under NASA IRB human subject protection protocols."
    ),
    "date": FieldDefinition(
        field_name="date",
        source_column_primary="Date",
        source_column_query="Date",
        data_type="datetime.date",
        raw_format_unit="M/D/YYYY",
        normalized_unit="ISO-8601 Date (YYYY-MM-DD)",
        valid_range="2004-09-07 to 2005-01-18",
        description="Calendar date of the sleep episode recording.",
        is_required=True,
        notes="Represents the start date of the night recording."
    ),
    "test_phase": FieldDefinition(
        field_name="test_phase",
        source_column_primary="Test_Phase",
        source_column_query="Test_Phase",
        data_type="str",
        raw_format_unit="Uppercase string",
        normalized_unit="Categorical Phase",
        valid_range="{'PRE_TEST', 'IN_TEST', 'POST_TEST'}",
        description="Operational experimental phase of the head-down tilt bed rest campaign.",
        is_required=True,
        notes=(
            "PRE_TEST = Ambulatory baseline (BR-2 to BR-1); "
            "IN_TEST = Confinement at 6° Head-Down Tilt (BR1 to BR60); "
            "POST_TEST = Recovery re-ambulation (BR+0 to BR+6)."
        )
    ),
    "br_day": FieldDefinition(
        field_name="br_day",
        source_column_primary="BR_Day",
        source_column_query="BR_Day",
        data_type="int",
        raw_format_unit="Integer",
        normalized_unit="Study Day Number",
        valid_range="0 to 60",
        description="Bed Rest experimental day counter within the current study phase.",
        is_required=True,
        notes="PRE_TEST uses days 1-2; IN_TEST uses days 1-60; POST_TEST uses days 0-6."
    ),
    "sleep_latency_minutes": FieldDefinition(
        field_name="sleep_latency_minutes",
        source_column_primary="Sleep Latency (hours)",
        source_column_query="Sleep latency",
        data_type="Optional[float]",
        raw_format_unit="HH:mm",
        normalized_unit="Minutes (float)",
        valid_range="0.0 to 300.0 minutes",
        description="Duration between lights-out / bedtime and confirmed sleep onset.",
        is_required=False,
        notes="Parsed from HH:mm (e.g. '0:14' -> 14.0 min; '1:48' -> 108.0 min). Null if missing or 'No Data'."
    ),
    "sleep_duration_minutes": FieldDefinition(
        field_name="sleep_duration_minutes",
        source_column_primary="Sleep Duration (hours)",
        source_column_query="Sleep duration",
        data_type="Optional[float]",
        raw_format_unit="HH:mm or HH:mm:ss",
        normalized_unit="Minutes (float)",
        valid_range="60.0 to 720.0 minutes (1h to 12h)",
        description="Total elapsed sleep time scored by the actigraph scoring algorithm.",
        is_required=False,
        notes="Parsed to total minutes (e.g. '7:20:00' -> 440.0 min). Null if missing or 'No Data'."
    ),
    "sleep_efficiency_pct": FieldDefinition(
        field_name="sleep_efficiency_pct",
        source_column_primary="Sleep Efficiency (%)",
        source_column_query="Sleep efficiency",
        data_type="Optional[float]",
        raw_format_unit="Percentage string or float",
        normalized_unit="Percent (float, 0.0 - 100.0)",
        valid_range="0.0 to 100.0 %",
        description="Percentage of total time in bed scored as sleep (Sleep Duration / Time in Bed * 100).",
        is_required=False,
        notes="Typical normal range is 85-95%. Lower values reflect sleep fragmentation."
    ),
    "medication_note": FieldDefinition(
        field_name="medication_note",
        source_column_primary="Notes",
        source_column_query="Comments",
        data_type="Optional[str]",
        raw_format_unit="Verbatim text",
        normalized_unit="Clinical Annotation String",
        valid_range="{'Ambien 5mg', 'Diphenhydramine 50mg', 'Diphenhydramine 25mg', 'No Data', None}",
        description="Clinical annotations regarding pharmacological sleep aids or missing data.",
        is_required=False,
        notes="Must NEVER be converted into a medical diagnosis or simulated symptom."
    ),
    "record_number": FieldDefinition(
        field_name="record_number",
        source_column_primary="None",
        source_column_query="Record Number",
        data_type="Optional[int]",
        raw_format_unit="Integer index",
        normalized_unit="Database Primary Key",
        valid_range="Positive integers",
        description="NASA LSDA internal database record number tracking the query result.",
        is_required=False,
        notes="Available only in the Query Result export."
    )
}

NON_INFERRABLE_VARIABLES: List[str] = [
    "heart_rate",
    "blood_oxygen_spo2",
    "blood_pressure_systolic",
    "blood_pressure_diastolic",
    "body_temperature",
    "stress_level",
    "mood",
    "physical_activity_steps"
]

NON_INFERENCE_POLICY = (
    "STRICT PROTOCOL RULE: The BRSMAct dataset does NOT contain cardiovascular numerics, "
    "oximetry, blood pressure, core body temperature, subjective stress, or mood questionnaires. "
    "The loader and research analysis modules MUST NEVER fabricate, impute, or synthesize "
    "these non-existent telemetry fields."
)
