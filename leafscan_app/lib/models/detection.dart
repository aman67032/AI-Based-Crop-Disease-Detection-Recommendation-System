class Detection {
  final String disease;
  final String diseaseKey;
  final String crop;
  final double confidence;
  final bool isHealthy;
  final String severity;

  Detection({
    required this.disease,
    required this.diseaseKey,
    required this.crop,
    required this.confidence,
    required this.isHealthy,
    required this.severity,
  });

  factory Detection.fromJson(Map<String, dynamic> json) {
    return Detection(
      disease: json['disease'] ?? '',
      diseaseKey: json['disease_key'] ?? '',
      crop: json['crop'] ?? '',
      confidence: (json['confidence'] ?? 0).toDouble(),
      isHealthy: json['is_healthy'] ?? false,
      severity: json['severity'] ?? 'LOW',
    );
  }
}

class Prediction {
  final String classKey;
  final String disease;
  final String crop;
  final double confidence;
  final bool isHealthy;

  Prediction({
    required this.classKey,
    required this.disease,
    required this.crop,
    required this.confidence,
    required this.isHealthy,
  });

  factory Prediction.fromJson(Map<String, dynamic> json) {
    return Prediction(
      classKey: json['class_key'] ?? '',
      disease: json['disease'] ?? '',
      crop: json['crop'] ?? '',
      confidence: (json['confidence'] ?? 0).toDouble(),
      isHealthy: json['is_healthy'] ?? false,
    );
  }
}

class TreatmentData {
  final String? chemical;
  final String? organic;
  final String? prevention;
  final String? urgency;
  final String? descriptionEn;
  final String? descriptionHi;

  TreatmentData({
    this.chemical,
    this.organic,
    this.prevention,
    this.urgency,
    this.descriptionEn,
    this.descriptionHi,
  });

  factory TreatmentData.fromJson(Map<String, dynamic> json) {
    return TreatmentData(
      chemical: json['chemical'],
      organic: json['organic'],
      prevention: json['prevention'],
      urgency: json['urgency'],
      descriptionEn: json['description_en'],
      descriptionHi: json['description_hi'],
    );
  }
}

class Recommendation {
  final String text;
  final String source;
  final TreatmentData treatmentData;

  Recommendation({
    required this.text,
    required this.source,
    required this.treatmentData,
  });

  factory Recommendation.fromJson(Map<String, dynamic> json) {
    return Recommendation(
      text: json['text'] ?? '',
      source: json['source'] ?? '',
      treatmentData: TreatmentData.fromJson(json['treatment_data'] ?? {}),
    );
  }
}

class DetectResponse {
  final String id;
  final Detection detection;
  final List<Prediction> predictions;
  final Recommendation recommendation;
  final String modelVersion;

  DetectResponse({
    required this.id,
    required this.detection,
    required this.predictions,
    required this.recommendation,
    required this.modelVersion,
  });

  factory DetectResponse.fromJson(Map<String, dynamic> json) {
    return DetectResponse(
      id: json['id'] ?? '',
      detection: Detection.fromJson(json['detection'] ?? {}),
      predictions: (json['predictions'] as List?)
              ?.map((p) => Prediction.fromJson(p))
              .toList() ??
          [],
      recommendation: Recommendation.fromJson(json['recommendation'] ?? {}),
      modelVersion: json['model_version'] ?? '',
    );
  }
}
