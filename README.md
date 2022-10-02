# Sidelinien Mobil

**Endelig en mobilløsning til FCK's debatforum www.Sidelinien.dk**

API'et er en simpel server-cors som hooker op til Sideliniens `vbshout.php` fil og henter de seneste shouts. Adgangen kræver at brugeren er logget ind med credentials fra www.sidelinien.dk hvor brugerID og password-token bliver anvendt i authorization headers.

Ideen er at smide websockets på, så denne løsning kan supportere en-til-mange uden at smadre/DDoS `vbshout.php`.

⚠️ **Work in progress - BETA-BETA!**

---

Dette er et hobby-projekt og er ikke associeret med FC København, Parken Sport & Entertainment, FCK Fan Club eller andre.
