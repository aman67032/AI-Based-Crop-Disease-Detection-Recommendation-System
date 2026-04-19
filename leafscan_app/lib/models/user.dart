class UserProfile {
  final String name;
  final String? email;
  final String? phone;
  final String? languagePref;
  final String? createdAt;

  UserProfile({
    required this.name,
    this.email,
    this.phone,
    this.languagePref,
    this.createdAt,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      name: json['name'] ?? 'User',
      email: json['email'],
      phone: json['phone'],
      languagePref: json['language_pref'],
      createdAt: json['created_at'],
    );
  }
}
