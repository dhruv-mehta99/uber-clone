import 'dart:async';
import 'package:driver_app/pages/root_page.dart';
import 'package:flutter/material.dart';
import 'package:driver_app/pages/home_page.dart';
import 'package:driver_app/pages/auth_page.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

void main() async {
  await dotenv.load();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: const SplashScreen(),
      routes: {
        '/auth': (context) => const AuthPage(),
        '/home': (context) => HomePage(),
        '/root': (context) => const RootPage()
      },
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({key});

  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Timer(const Duration(seconds: 3), () {
      Navigator.of(context).pushReplacementNamed('/root');
    });
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text(
          'Uber Driver App',
          style: TextStyle(fontSize: 30.0),
        ),
      ),
    );
  }
}
