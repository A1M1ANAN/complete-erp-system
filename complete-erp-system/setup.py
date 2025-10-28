#!/usr/bin/env python3
"""
نظام ERP المتكامل - ملف الإعداد والتثبيت
Complete ERP System - Setup and Installation Script
"""

import os
import sys
import subprocess
import platform
import webbrowser
import time
from pathlib import Path

def print_banner():
    """طباعة شعار النظام"""
    banner = """
    ╔══════════════════════════════════════════════════════════════╗
    ║                    نظام ERP المتكامل                        ║
    ║                  Complete ERP System                        ║
    ║                                                              ║
    ║  نظام إدارة موارد المؤسسات الشامل مع دعم اللغة العربية      ║
    ║  Comprehensive Enterprise Resource Planning System           ║
    ╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def check_python_version():
    """فحص إصدار Python"""
    print("🔍 فحص إصدار Python...")
    if sys.version_info < (3, 8):
        print("❌ خطأ: يتطلب Python 3.8 أو أحدث")
        print(f"الإصدار الحالي: {sys.version}")
        sys.exit(1)
    print(f"✅ Python {sys.version.split()[0]} - متوافق")

def check_node_version():
    """فحص إصدار Node.js"""
    print("🔍 فحص إصدار Node.js...")
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"✅ Node.js {version} - متوافق")
            return True
        else:
            print("❌ Node.js غير مثبت")
            return False
    except FileNotFoundError:
        print("❌ Node.js غير مثبت")
        return False

def install_python_dependencies():
    """تثبيت متطلبات Python"""
    print("📦 تثبيت متطلبات Python...")
    backend_path = Path("backend")
    requirements_file = backend_path / "requirements.txt"
    
    if requirements_file.exists():
        try:
            subprocess.run([
                sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
            ], check=True)
            print("✅ تم تثبيت متطلبات Python بنجاح")
        except subprocess.CalledProcessError:
            print("❌ فشل في تثبيت متطلبات Python")
            return False
    else:
        print("❌ ملف requirements.txt غير موجود")
        return False
    
    return True

def install_node_dependencies():
    """تثبيت متطلبات Node.js"""
    print("📦 تثبيت متطلبات Node.js...")
    
    # Check if package.json exists
    if not Path("package.json").exists():
        print("❌ ملف package.json غير موجود")
        return False
    
    try:
        # Try npm first, then yarn
        if subprocess.run(['npm', '--version'], capture_output=True).returncode == 0:
            subprocess.run(['npm', 'install'], check=True)
            print("✅ تم تثبيت متطلبات Node.js بنجاح باستخدام npm")
        elif subprocess.run(['yarn', '--version'], capture_output=True).returncode == 0:
            subprocess.run(['yarn', 'install'], check=True)
            print("✅ تم تثبيت متطلبات Node.js بنجاح باستخدام yarn")
        else:
            print("❌ npm أو yarn غير مثبت")
            return False
    except subprocess.CalledProcessError:
        print("❌ فشل في تثبيت متطلبات Node.js")
        return False
    
    return True

def setup_database():
    """إعداد قاعدة البيانات"""
    print("🗄️ إعداد قاعدة البيانات...")
    
    backend_path = Path("backend")
    os.chdir(backend_path)
    
    try:
        # Initialize database
        subprocess.run([sys.executable, "-c", "from app import db; db.create_all()"], check=True)
        print("✅ تم إعداد قاعدة البيانات بنجاح")
        
        os.chdir("..")
        return True
    except subprocess.CalledProcessError:
        print("❌ فشل في إعداد قاعدة البيانات")
        os.chdir("..")
        return False

def create_env_file():
    """إنشاء ملف البيئة"""
    print("⚙️ إنشاء ملف الإعدادات...")
    
    env_content = """# Flask Configuration
SECRET_KEY=your-secret-key-change-this-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-this-in-production
FLASK_ENV=development
FLASK_DEBUG=True

# Database Configuration
DATABASE_URL=sqlite:///erp_system.db

# Company Default Settings
DEFAULT_COMPANY_NAME=شركة تجريبية
DEFAULT_CURRENCY=SAR
DEFAULT_VAT_RATE=15.0

# Email Configuration (Optional)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
"""
    
    env_file = Path("backend") / ".env"
    if not env_file.exists():
        with open(env_file, 'w', encoding='utf-8') as f:
            f.write(env_content)
        print("✅ تم إنشاء ملف الإعدادات")
    else:
        print("ℹ️ ملف الإعدادات موجود بالفعل")

def start_backend():
    """تشغيل الخادم الخلفي"""
    print("🚀 تشغيل الخادم الخلفي...")
    
    backend_path = Path("backend")
    
    try:
        # Start Flask app in background
        process = subprocess.Popen([
            sys.executable, "app.py"
        ], cwd=backend_path)
        
        print("✅ تم تشغيل الخادم الخلفي على http://localhost:5000")
        return process
    except Exception as e:
        print(f"❌ فشل في تشغيل الخادم الخلفي: {e}")
        return None

def start_frontend():
    """تشغيل الواجهة الأمامية"""
    print("🚀 تشغيل الواجهة الأمامية...")
    
    try:
        # Check if npm is available
        if subprocess.run(['npm', '--version'], capture_output=True).returncode == 0:
            process = subprocess.Popen(['npm', 'run', 'dev'])
        elif subprocess.run(['yarn', '--version'], capture_output=True).returncode == 0:
            process = subprocess.Popen(['yarn', 'dev'])
        else:
            print("❌ npm أو yarn غير متوفر")
            return None
        
        print("✅ تم تشغيل الواجهة الأمامية على http://localhost:5173")
        return process
    except Exception as e:
        print(f"❌ فشل في تشغيل الواجهة الأمامية: {e}")
        return None

def open_browser():
    """فتح المتصفح"""
    print("🌐 فتح المتصفح...")
    time.sleep(3)  # Wait for server to start
    try:
        webbrowser.open('http://localhost:5173')
        print("✅ تم فتح النظام في المتصفح")
    except Exception as e:
        print(f"❌ فشل في فتح المتصفح: {e}")
        print("يرجى فتح http://localhost:5173 يدوياً")

def print_success_message():
    """طباعة رسالة النجاح"""
    success_message = """
    ╔══════════════════════════════════════════════════════════════╗
    ║                    🎉 تم التثبيت بنجاح! 🎉                  ║
    ╠══════════════════════════════════════════════════════════════╣
    ║                                                              ║
    ║  🌐 الواجهة الأمامية: http://localhost:5173                ║
    ║  🔧 API الخلفي: http://localhost:5000                       ║
    ║                                                              ║
    ║  👤 المستخدم الافتراضي:                                    ║
    ║     اسم المستخدم: admin                                     ║
    ║     كلمة المرور: admin123                                   ║
    ║                                                              ║
    ║  📚 للمساعدة والدعم:                                       ║
    ║     📖 اقرأ ملف README.md                                   ║
    ║     🐛 أبلغ عن المشاكل على GitHub                          ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    
    🚀 استمتع باستخدام نظام ERP المتكامل!
    """
    print(success_message)

def main():
    """الدالة الرئيسية"""
    print_banner()
    
    # Check system requirements
    check_python_version()
    
    if not check_node_version():
        print("\n❌ يرجى تثبيت Node.js من https://nodejs.org")
        print("ثم إعادة تشغيل هذا الملف")
        sys.exit(1)
    
    print("\n" + "="*60)
    print("بدء عملية التثبيت...")
    print("="*60)
    
    # Install dependencies
    if not install_python_dependencies():
        print("❌ فشل في تثبيت متطلبات Python")
        sys.exit(1)
    
    if not install_node_dependencies():
        print("❌ فشل في تثبيت متطلبات Node.js")
        sys.exit(1)
    
    # Setup environment
    create_env_file()
    
    # Setup database
    if not setup_database():
        print("❌ فشل في إعداد قاعدة البيانات")
        sys.exit(1)
    
    print("\n" + "="*60)
    print("تشغيل النظام...")
    print("="*60)
    
    # Start services
    backend_process = start_backend()
    if not backend_process:
        print("❌ فشل في تشغيل الخادم الخلفي")
        sys.exit(1)
    
    frontend_process = start_frontend()
    if not frontend_process:
        print("❌ فشل في تشغيل الواجهة الأمامية")
        backend_process.terminate()
        sys.exit(1)
    
    # Open browser
    open_browser()
    
    # Print success message
    print_success_message()
    
    try:
        print("اضغط Ctrl+C لإيقاف النظام...")
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 إيقاف النظام...")
        if backend_process:
            backend_process.terminate()
        if frontend_process:
            frontend_process.terminate()
        print("✅ تم إيقاف النظام بنجاح")

if __name__ == "__main__":
    main()
