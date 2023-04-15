import 'dart:io';

import 'package:driver_app/services/driver_service.dart';
import 'package:driver_app/services/socket_service.dart';
import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:shared_preferences/shared_preferences.dart';

// ignore: use_key_in_widget_constructors
class HomePage extends StatefulWidget {
  final SocketService socketService = SocketService();

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final Future<SharedPreferences> _prefs = SharedPreferences.getInstance();
  String driverName;

  @override
  void initState() {
    super.initState();
    _prefs.then((SharedPreferences prefs) {
      setState(() {
        driverName = prefs.getString('driver_name');
      });
    });
    widget.socketService.messages.listen((Map<String, dynamic> data) {
      showRideAcceptanceWidget(data);
    });

    widget.socketService.pings.listen((String data) {
      Fluttertoast.showToast(
          msg: "recieved ping from server",
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.CENTER,
          timeInSecForIosWeb: 1,
          backgroundColor: Colors.red,
          textColor: Colors.white,
          fontSize: 16.0);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text('Driver Dashboard'),
        ),
        body: Center(
          child: Text(
            'Welcome $driverName\nwe are searching rides for you',
            style: const TextStyle(fontSize: 24),
            textAlign: TextAlign.center,
          ),
        ));
  }

  @override
  void dispose() {
    widget.socketService.disconnect();
    super.dispose();
  }

  Future<dynamic> showRideAcceptanceWidget(Map<String, dynamic> data) {
    var rideId = data["_id"];
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
            title: const Text('New Ride Available'),
            content: Text(
                'Pickup from ${data["source_address"]} and drop to ${data["destination_address"]} for Rs ${data["fare"]}'),
            actions: <Widget>[
              TextButton(
                child: const Text('Reject'),
                onPressed: () async {
                  try {
                    Fluttertoast.showToast(
                        msg: "please wait while your ride is being rejected",
                        toastLength: Toast.LENGTH_SHORT,
                        gravity: ToastGravity.CENTER,
                        timeInSecForIosWeb: 1,
                        backgroundColor: Colors.red,
                        textColor: Colors.white,
                        fontSize: 16.0);
                    Navigator.pop(context);
                    await DriverService().rejectRide(rideId);
                    Fluttertoast.showToast(
                        msg: "ride rejected successfully",
                        toastLength: Toast.LENGTH_SHORT,
                        gravity: ToastGravity.CENTER,
                        timeInSecForIosWeb: 1,
                        backgroundColor: Colors.red,
                        textColor: Colors.white,
                        fontSize: 16.0);
                  } catch (error) {
                    print(error);
                    Fluttertoast.showToast(
                        msg: error is HttpException
                            ? error.message
                            : "failed to reject ride",
                        toastLength: Toast.LENGTH_SHORT,
                        gravity: ToastGravity.CENTER,
                        timeInSecForIosWeb: 1,
                        backgroundColor: Colors.red,
                        textColor: Colors.white,
                        fontSize: 16.0);
                  }
                },
              ),
              TextButton(
                child: const Text('Accept'),
                onPressed: () async {
                  try {
                    Fluttertoast.showToast(
                        msg: "please wait while your ride is being accepted",
                        toastLength: Toast.LENGTH_SHORT,
                        gravity: ToastGravity.CENTER,
                        timeInSecForIosWeb: 1,
                        backgroundColor: Colors.red,
                        textColor: Colors.white,
                        fontSize: 16.0);
                    Navigator.pop(context, false);
                    await DriverService().acceptRide(rideId);
                    Fluttertoast.showToast(
                        msg: "ride accepted successfully",
                        toastLength: Toast.LENGTH_SHORT,
                        gravity: ToastGravity.CENTER,
                        timeInSecForIosWeb: 1,
                        backgroundColor: Colors.red,
                        textColor: Colors.white,
                        fontSize: 16.0);
                  } catch (error) {
                    print(error);
                    Fluttertoast.showToast(
                        msg: error is HttpException
                            ? error.message
                            : "failed to accept ride",
                        toastLength: Toast.LENGTH_SHORT,
                        gravity: ToastGravity.CENTER,
                        timeInSecForIosWeb: 1,
                        backgroundColor: Colors.red,
                        textColor: Colors.white,
                        fontSize: 16.0);
                  }
                },
              ),
            ],
          );
        });
  }
}
