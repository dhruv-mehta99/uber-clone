import 'dart:io';

import 'package:driver_app/services/socket_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

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
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text('Driver Dashboard'),
        ),
        body: StreamBuilder(
          stream: widget.socketService.messages,
          builder: (context, snapshot) {
            if (snapshot.hasData) {
              showDialog(
                context: context,
                builder: (BuildContext context) {
                  return AlertDialog(
                    title: const Text('New Ride Available'),
                    content: Text(
                        'Pickup from ${snapshot.data["source_address"]} and drop to ${snapshot.data["destination_address"]} for Rs ${snapshot.data["fare"]}'),
                    actions: <Widget>[
                      TextButton(
                        child: Text('Reject'),
                        onPressed: () {
                          Navigator.of(context).pop();
                        },
                      ),
                      TextButton(
                        child: Text('Accept'),
                        onPressed: () {
                          // Perform the desired action here
                          Navigator.of(context).pop();
                        },
                      ),
                    ],
                  );
                },
              );

              // handle event data and update UI accordingly
              //  Text(snapshot.data["_id"].toString());
            }
            return Center(
              child: Text(
                'Welcome $driverName\nwe are searching rides for you',
                style: const TextStyle(fontSize: 24),
                textAlign: TextAlign.center,
              ),
            );
          },
        ));
  }

  @override
  void dispose() {
    widget.socketService.disconnect();
    super.dispose();
  }
}
