import 'package:driver_app/data_provider/auth_provider.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';

class GoogleSignInAPI {
  Future<void> signInWithGoogle() async {
    try {
      try {
        await GoogleSignIn().disconnect();
      } catch (error) {
        // no op
      }

      final signIn = GoogleSignIn.standard();

      final googleUser = await signIn.signIn();

      final googleAuth = await googleUser?.authentication;

      if (googleAuth != null && googleAuth.idToken != null) {
        final authData = await AuthProvider().googleOAuth(googleAuth.idToken);
        SharedPreferences prefs = await SharedPreferences.getInstance();

        print(authData["data"]["access_token"]);
        prefs.setString('token', authData["data"]["access_token"]);

        return true;
      } else {
        return false;
      }
    } catch (ex, stackTrace) {
      print(stackTrace);
      return false;
    }
  }
}
