# Setup-Anleitung: dev.alie.info

## Status
- [x] Website-Dateien zu GitHub gepusht
- [ ] GitHub Pages aktivieren (User Input erforderlich)
- [ ] DNS bei United umstellen (User Input erforderlich)

---

## Schritt 1: GitHub Pages aktivieren

1. Öffne: https://github.com/halil3210/web/settings/pages
2. **Source**: Wähle `Deploy from a branch`
3. **Branch**: Wähle `main` und `/ (root)`
4. Klicke **Save**
5. Warte 1-2 Minuten bis GitHub die Seite deployed

Nach Aktivierung ist die Seite temporär unter `https://halil3210.github.io/web` erreichbar.

---

## Schritt 2: DNS bei United Domains umstellen

### Option A: A-Records (empfohlen)

Gehe zu: https://united-domains.de/portfolio/domain-admin/dns/

**Domain:** `alie.info`  
**Subdomain:** `dev`

Lösche den alten A-Record:
| Subdomain | IP (löschen) |
|-----------|--------------|
| dev | 49.13.165.223 |

Füge diese 4 neuen A-Records hinzu:
| Subdomain | Neue IP |
|-----------|---------|
| dev | 185.199.108.153 |
| dev | 185.199.109.153 |
| dev | 185.199.110.153 |
| dev | 185.199.111.153 |

### Option B: CNAME-Record (alternativ)

Falls A-Records nicht funktionieren, erstelle einen CNAME:
| Subdomain | Typ | Ziel |
|-----------|-----|------|
| dev | CNAME | halil3210.github.io |

---

## Schritt 3: SSL-Zertifikat (automatisch)

Nach DNS-Propagation (kann bis zu 24h dauern):
1. Gehe zu: https://github.com/halil3210/web/settings/pages
2. Aktiviere **"Enforce HTTPS"**

---

## Verifizierung

Nach Abschluss aller Schritte sollte `https://dev.alie.info` die Portfolio-Website anzeigen.

### Troubleshooting

- **DNS nicht propagiert?** Prüfe mit: `dig dev.alie.info`
- **404 Fehler?** Stelle sicher, dass `index.html` im Root liegt
- **SSL-Fehler?** Warte 24h nach DNS-Änderung, dann HTTPS enforced aktivieren
