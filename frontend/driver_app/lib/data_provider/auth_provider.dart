import 'dart:convert';
import 'dart:io';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

class AuthProvider {
  final _oauthURL = '${dotenv.env['BASE_URL']}/api/driver/oauth';

  Future<Map<String, dynamic>> googleOAuth(String token) async {
    try {
      return json.decode(
        (await http.post(
          Uri.parse('$_oauthURL/google/authorize?request_token=$token'),
          headers: {'Authorization': 'Bearer $token'},
        ))
            .body,
      );
    } on SocketException {
      throw Exception('No Internet connection');
    }
  }
}
