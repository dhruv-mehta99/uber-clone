import 'package:driver_app/data_provider/driver_provider.dart';
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

  Future<void> acceptRide(String rideId) async {
    try {
      var resp = await DriverProvider().acceptRide(rideId);
      return;
    } catch (ex) {
      rethrow;
    }
  }

  Future<void> rejectRide(String rideId) async {
    try {
      await DriverProvider().rejectRide(rideId);
    } catch (ex) {
      rethrow;
    }
  }
}
