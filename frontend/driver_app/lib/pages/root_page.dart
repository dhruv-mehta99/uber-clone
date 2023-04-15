import 'package:driver_app/pages/auth_page.dart';
import 'package:driver_app/pages/home_page.dart';
import 'package:driver_app/services/driver_service.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:fluttertoast/fluttertoast.dart';

class RootPage extends StatefulWidget {
  const RootPage({Key key}) : super(key: key);

  @override
  State<RootPage> createState() => _RootPageState();
}

class _RootPageState extends State<RootPage> {
  String _authStatus = null;
  @override
  initState() {
    super.initState();

    SharedPreferences.getInstance().then((prefs) async {
      var token = prefs.getString("token");

      if (token != null) {
        try {
          await DriverService().getDriverDetails();
          Fluttertoast.showToast(
              msg: "driver authenticated",
              toastLength: Toast.LENGTH_SHORT,
              gravity: ToastGravity.CENTER,
              timeInSecForIosWeb: 1,
              backgroundColor: Colors.red,
              textColor: Colors.white,
              fontSize: 16.0);
          setState(() {
            _authStatus = "LOGGED_IN";
          });
        } catch (error) {
          print("error caught in router page");
          setState(() {
            _authStatus = "NOT_LOGGED_IN";
          });
          Fluttertoast.showToast(
              msg: "User not authorized",
              toastLength: Toast.LENGTH_SHORT,
              gravity: ToastGravity.CENTER,
              timeInSecForIosWeb: 1,
              backgroundColor: Colors.red,
              textColor: Colors.white,
              fontSize: 16.0);
        }
      } else {
        setState(() {
          _authStatus = "NOT_LOGGED_IN";
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    switch (_authStatus) {
      case "NOT_LOGGED_IN":
        return const AuthPage();
      case "LOGGED_IN":
        return HomePage();
      default:
        return const Scaffold(
          body: Center(
            child: Text(
              'Authenticating User',
              style: TextStyle(fontSize: 30.0),
            ),
          ),
        );
    }
  }
}
