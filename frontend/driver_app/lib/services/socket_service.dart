import 'dart:async';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  IO.Socket socket;
  final StreamController<Map<String, dynamic>> _newRideController =
      StreamController<Map<String, dynamic>>.broadcast();

  final StreamController<String> _pingController =
      StreamController<String>.broadcast();

  SocketService() {
    socket = IO.io(dotenv.env['BASE_URL'], <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });

    socket.on('new_ride', (data) {
      _newRideController.add(data);
    });

    socket.on('ping', (data) async {
      _pingController.add(data);
      SharedPreferences prefs = await SharedPreferences.getInstance();

      socket.emit("ping_back", prefs.getString("driver_id"));
    });

    socket.connect();
  }

  Stream<Map<String, dynamic>> get messages => _newRideController.stream;
  Stream<String> get pings => _pingController.stream;

  void disconnect() {
    socket.disconnect();
  }
}
