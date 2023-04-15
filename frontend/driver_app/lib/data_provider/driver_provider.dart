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
      var resp = await http.get(
        Uri.parse('$_driverURL/details'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (resp.statusCode != 200) {
        throw HttpException(json.decode(resp.body)["message"]);
      }
      return json.decode(
        resp.body,
      );
    } on SocketException {
      throw Exception('No Internet connection');
    } catch (error) {
      print(error);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> acceptRide(String rideId) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      var token = prefs.getString("token");
      var resp = await http.patch(
        Uri.parse('$_driverURL/ride/$rideId/accept'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (resp.statusCode != 200) {
        throw HttpException(json.decode(resp.body)["message"]);
      }
      return json.decode(
        resp.body,
      );
    } on SocketException {
      throw Exception('No Internet connection');
    }
  }

  Future<Map<String, dynamic>> rejectRide(String rideId) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      var token = prefs.getString("token");
      var resp = await http.patch(
        Uri.parse('$_driverURL/ride/$rideId/reject'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (resp.statusCode != 200) {
        throw HttpException(json.decode(resp.body)["message"]);
      }
      return json.decode(
        resp.body,
      );
    } on SocketException {
      throw Exception('No Internet connection');
    } catch (error) {
      rethrow;
    }
  }
}
