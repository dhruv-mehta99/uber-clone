import 'dart:async';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  IO.Socket socket;
  final StreamController<Map<String, dynamic>> _messageController =
      StreamController<Map<String, dynamic>>.broadcast();

  SocketService() {
    socket = IO.io(dotenv.env['BASE_URL'], <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });

    socket.on('new_ride', (data) {
      _messageController.add(data);
    });

    socket.connect();
  }

  Stream<Map<String, dynamic>> get messages => _messageController.stream;

  void disconnect() {
    socket.disconnect();
  }
}
