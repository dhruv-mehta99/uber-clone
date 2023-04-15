import 'dart:convert';
import 'dart:io';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class DriverProvider {
  final _driverURL = '${dotenv.env['BASE_URL']}/api/driver';

  Future<Map<String, dynamic>> getDetails() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      var token = prefs.getString("token");
      return json.decode(
        (await http.get(
          Uri.parse('$_driverURL/details'),
          headers: {'Authorization': 'Bearer $token'},
        ))
            .body,
      );
    } on SocketException {
      throw Exception('No Internet connection');
    } catch (error) {
      print("in catch error");
      print(error);
      rethrow;
    }
  }
}
