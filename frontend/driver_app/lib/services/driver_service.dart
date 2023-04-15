import 'package:driver_app/data_provider/auth_provider.dart';
import 'package:driver_app/data_provider/driver_provider.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DriverService {
  Future<void> getDriverDetails() async {
    try {
      final driverData = await DriverProvider().getDetails();
      SharedPreferences prefs = await SharedPreferences.getInstance();

      print(driverData["data"]);
      prefs.setString('driver_name', driverData["data"]["name"]);
    } catch (ex, stackTrace) {
      print(stackTrace);
      rethrow;
    }
  }
}
