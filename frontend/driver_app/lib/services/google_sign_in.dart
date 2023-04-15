import 'package:driver_app/data_provider/auth_provider.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

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
        String jwtToken = authData["data"]["access_token"];
        Map<String, dynamic> decodedToken = JwtDecoder.decode(jwtToken);
        String driverId = decodedToken['driver_id'];

        print(jwtToken);
        prefs.setString('token', jwtToken);
        prefs.setString('driver_id', driverId);

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
