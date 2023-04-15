import 'package:driver_app/services/google_sign_in.dart';
import 'package:flutter/material.dart';

class AuthPage extends StatelessWidget {
  const AuthPage({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[300],
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              'assets/logo.png',
              height: 100,
              width: 100,
            ),
            const SizedBox(height: 20),
            const Text(
              'Login with Google',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () async {
                await signIn(context);
              },
              child: const Text("Login with Google"),
            ),
          ],
        ),
      ),
    );
  }

  Future signIn(BuildContext context) async {
    try {
      await GoogleSignInAPI().signInWithGoogle();
      Navigator.of(context).pushReplacementNamed('/root');
    } catch (error) {
      print(error);
    }
  }
}
