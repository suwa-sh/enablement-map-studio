#!/bin/sh

# 自己署名証明書を生成するスクリプト
# 有効期限: 100年（36500日）

set -e

SSL_DIR="/etc/nginx/ssl"
CERT_FILE="$SSL_DIR/server.crt"
KEY_FILE="$SSL_DIR/server.key"
CONFIG_FILE="$SSL_DIR/openssl.cnf"

# SSLディレクトリを作成
mkdir -p "$SSL_DIR"

# OpenSSL設定ファイルを作成（SAN対応）
cat > "$CONFIG_FILE" << EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C=JP
ST=Tokyo
L=Tokyo
O=Enablement Map Studio
OU=Development
CN=localhost

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
IP.3 = 0.0.0.0
# 必要に応じて他のIPアドレスを追加してください
# 例: IP.4 = 192.168.1.100
# 例: IP.5 = 10.0.0.100
EOF

# 自己署名証明書を生成
openssl req -x509 \
  -nodes \
  -days 36500 \
  -newkey rsa:2048 \
  -keyout "$KEY_FILE" \
  -out "$CERT_FILE" \
  -config "$CONFIG_FILE" \
  -extensions v3_req

# パーミッションを設定
chmod 600 "$KEY_FILE"
chmod 644 "$CERT_FILE"

# 設定ファイルを削除
rm -f "$CONFIG_FILE"

echo "Self-signed certificate generated successfully"
echo "Certificate: $CERT_FILE"
echo "Private Key: $KEY_FILE"
echo "Valid for: 100 years (36500 days)"
echo "Subject Alternative Names: localhost, *.localhost, 127.0.0.1, ::1, 0.0.0.0"
