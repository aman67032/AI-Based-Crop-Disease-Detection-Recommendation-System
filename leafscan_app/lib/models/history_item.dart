class HistoryItem {
  final String id;
  final String cropType;
  final String diseaseName;
  final double confidence;
  final String severity;
  final String createdAt;
  final String? imageFilename;
  final Map<String, dynamic>? recommendation;
  final String? visionAnalysis;
  final String? visionSource;

  HistoryItem({
    required this.id,
    required this.cropType,
    required this.diseaseName,
    required this.confidence,
    required this.severity,
    required this.createdAt,
    this.imageFilename,
    this.recommendation,
    this.visionAnalysis,
    this.visionSource,
  });

  factory HistoryItem.fromJson(Map<String, dynamic> json) {
    return HistoryItem(
      id: json['id'] ?? json['_id'] ?? '',
      cropType: json['crop_type'] ?? '',
      diseaseName: json['disease_name'] ?? '',
      confidence: (json['confidence'] ?? 0).toDouble(),
      severity: json['severity'] ?? 'LOW',
      createdAt: json['created_at'] ?? '',
      imageFilename: json['image_filename'],
      recommendation: json['recommendation'],
      visionAnalysis: json['vision_analysis'],
      visionSource: json['vision_source'],
    );
  }

  String get formattedDisease =>
      diseaseName.replaceAll('___', ' — ').replaceAll('_', ' ');

  bool get isHealthy => diseaseName.toLowerCase().contains('healthy');
}
