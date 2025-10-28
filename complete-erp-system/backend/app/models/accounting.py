from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from decimal import Decimal
import sys
import os

# Add the parent directory to the path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

db = SQLAlchemy()

class Account(db.Model):
    __tablename__ = 'accounts'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    name_en = db.Column(db.String(200), nullable=True)
    description = db.Column(db.Text, nullable=True)
    
    # Account Classification
    account_type = db.Column(db.String(20), nullable=False)  # asset, liability, equity, revenue, expense
    account_subtype = db.Column(db.String(30), nullable=True)  # current_asset, fixed_asset, current_liability, etc.
    
    # Hierarchy
    parent_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=True)
    level = db.Column(db.Integer, default=1)
    
    # Balance Information
    normal_balance = db.Column(db.String(10), nullable=False)  # debit, credit
    current_balance = db.Column(db.Float, default=0.0)
    opening_balance = db.Column(db.Float, default=0.0)
    
    # Settings
    is_active = db.Column(db.Boolean, default=True)
    is_system_account = db.Column(db.Boolean, default=False)  # System accounts cannot be deleted
    allow_posting = db.Column(db.Boolean, default=True)  # Allow direct posting to this account
    
    # Currency
    currency = db.Column(db.String(3), default='SAR')
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    parent = db.relationship('Account', remote_side=[id], backref='children', lazy=True)
    journal_entries = db.relationship('JournalEntry', backref='account', lazy=True)
    
    def get_balance(self, as_of_date=None):
        """Get account balance as of specific date"""
        query = JournalEntry.query.filter_by(account_id=self.id)
        
        if as_of_date:
            query = query.filter(JournalEntry.entry_date <= as_of_date)
        
        entries = query.all()
        
        balance = self.opening_balance
        for entry in entries:
            if self.normal_balance == 'debit':
                balance += entry.debit_amount - entry.credit_amount
            else:
                balance += entry.credit_amount - entry.debit_amount
        
        return balance
    
    def get_full_code(self):
        """Get full account code with parent codes"""
        if self.parent:
            return f"{self.parent.get_full_code()}.{self.code}"
        return self.code
    
    def get_full_name(self):
        """Get full account name with parent names"""
        if self.parent:
            return f"{self.parent.get_full_name()} > {self.name}"
        return self.name
    
    def update_balance(self, debit_amount=0, credit_amount=0):
        """Update current balance"""
        if self.normal_balance == 'debit':
            self.current_balance += debit_amount - credit_amount
        else:
            self.current_balance += credit_amount - debit_amount
        
        db.session.commit()
    
    def to_dict(self, include_balance=True):
        """Convert account object to dictionary"""
        data = {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'name_en': self.name_en,
            'description': self.description,
            'account_type': self.account_type,
            'account_subtype': self.account_subtype,
            'parent_id': self.parent_id,
            'level': self.level,
            'normal_balance': self.normal_balance,
            'opening_balance': self.opening_balance,
            'is_active': self.is_active,
            'is_system_account': self.is_system_account,
            'allow_posting': self.allow_posting,
            'currency': self.currency,
            'full_code': self.get_full_code(),
            'full_name': self.get_full_name(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_balance:
            data['current_balance'] = self.get_balance()
        
        return data
    
    def __repr__(self):
        return f'<Account {self.code}: {self.name}>'


class JournalEntry(db.Model):
    __tablename__ = 'journal_entries'
    
    id = db.Column(db.Integer, primary_key=True)
    entry_number = db.Column(db.String(50), unique=True, nullable=False)
    
    # Entry Information
    entry_date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    description = db.Column(db.Text, nullable=False)
    
    # Reference Information
    reference_type = db.Column(db.String(20), nullable=True)  # invoice, purchase, payment, adjustment
    reference_id = db.Column(db.Integer, nullable=True)
    reference_number = db.Column(db.String(100), nullable=True)
    
    # Amounts
    total_debit = db.Column(db.Float, default=0.0)
    total_credit = db.Column(db.Float, default=0.0)
    
    # Status
    status = db.Column(db.String(20), default='draft')  # draft, posted, reversed
    
    # User Information
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    posted_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    posted_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    entries = db.relationship('JournalEntryLine', backref='journal_entry', lazy=True, cascade='all, delete-orphan')
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_journal_entries', lazy=True)
    poster = db.relationship('User', foreign_keys=[posted_by], backref='posted_journal_entries', lazy=True)
    
    def calculate_totals(self):
        """Calculate total debits and credits"""
        self.total_debit = sum(line.debit_amount for line in self.entries)
        self.total_credit = sum(line.credit_amount for line in self.entries)
        db.session.commit()
    
    def is_balanced(self):
        """Check if journal entry is balanced"""
        return abs(self.total_debit - self.total_credit) < 0.01
    
    def post(self, posted_by_user_id):
        """Post journal entry"""
        if not self.is_balanced():
            raise ValueError("Journal entry is not balanced")
        
        self.status = 'posted'
        self.posted_by = posted_by_user_id
        self.posted_at = datetime.utcnow()
        
        # Update account balances
        for line in self.entries:
            if line.account:
                line.account.update_balance(line.debit_amount, line.credit_amount)
        
        db.session.commit()
    
    def reverse(self, reversal_date=None, description=None):
        """Create reversal entry"""
        if reversal_date is None:
            reversal_date = datetime.now().date()
        
        if description is None:
            description = f"Reversal of {self.entry_number}"
        
        # Create reversal entry
        reversal = JournalEntry(
            entry_number=self.generate_entry_number(),
            entry_date=reversal_date,
            description=description,
            reference_type='reversal',
            reference_id=self.id,
            reference_number=self.entry_number,
            created_by=self.created_by
        )
        
        db.session.add(reversal)
        db.session.flush()
        
        # Create reversal lines (swap debits and credits)
        for line in self.entries:
            reversal_line = JournalEntryLine(
                journal_entry_id=reversal.id,
                account_id=line.account_id,
                description=f"Reversal: {line.description}",
                debit_amount=line.credit_amount,
                credit_amount=line.debit_amount
            )
            db.session.add(reversal_line)
        
        reversal.calculate_totals()
        self.status = 'reversed'
        
        db.session.commit()
        return reversal
    
    def to_dict(self, include_lines=False):
        """Convert journal entry object to dictionary"""
        data = {
            'id': self.id,
            'entry_number': self.entry_number,
            'entry_date': self.entry_date.isoformat(),
            'description': self.description,
            'reference_type': self.reference_type,
            'reference_id': self.reference_id,
            'reference_number': self.reference_number,
            'total_debit': self.total_debit,
            'total_credit': self.total_credit,
            'status': self.status,
            'created_by': self.created_by,
            'posted_by': self.posted_by,
            'created_at': self.created_at.isoformat(),
            'posted_at': self.posted_at.isoformat() if self.posted_at else None,
            'is_balanced': self.is_balanced()
        }
        
        if include_lines:
            data['entries'] = [line.to_dict() for line in self.entries]
        
        return data
    
    @staticmethod
    def generate_entry_number():
        """Generate next journal entry number"""
        last_entry = JournalEntry.query.order_by(JournalEntry.id.desc()).first()
        if last_entry:
            last_number = int(last_entry.entry_number.split('-')[1])
            return f"JE-{str(last_number + 1).zfill(6)}"
        return "JE-000001"
    
    def __repr__(self):
        return f'<JournalEntry {self.entry_number}>'


class JournalEntryLine(db.Model):
    __tablename__ = 'journal_entry_lines'
    
    id = db.Column(db.Integer, primary_key=True)
    journal_entry_id = db.Column(db.Integer, db.ForeignKey('journal_entries.id'), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    
    # Entry Details
    description = db.Column(db.Text, nullable=False)
    debit_amount = db.Column(db.Float, default=0.0)
    credit_amount = db.Column(db.Float, default=0.0)
    
    # Additional Information
    reference = db.Column(db.String(100), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    account = db.relationship('Account', backref='journal_entry_lines', lazy=True)
    
    def to_dict(self):
        """Convert journal entry line object to dictionary"""
        return {
            'id': self.id,
            'journal_entry_id': self.journal_entry_id,
            'account_id': self.account_id,
            'account_code': self.account.code if self.account else None,
            'account_name': self.account.name if self.account else None,
            'description': self.description,
            'debit_amount': self.debit_amount,
            'credit_amount': self.credit_amount,
            'reference': self.reference,
            'created_at': self.created_at.isoformat()
        }
    
    def __repr__(self):
        return f'<JournalEntryLine A:{self.account_id} D:{self.debit_amount} C:{self.credit_amount}>'


class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    payment_number = db.Column(db.String(50), unique=True, nullable=False)
    
    # Payment Information
    payment_date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    payment_type = db.Column(db.String(20), nullable=False)  # receipt, payment
    amount = db.Column(db.Float, nullable=False)
    
    # Party Information
    party_type = db.Column(db.String(20), nullable=False)  # customer, supplier, employee, other
    party_id = db.Column(db.Integer, nullable=True)
    party_name = db.Column(db.String(200), nullable=False)
    
    # Payment Method
    payment_method = db.Column(db.String(20), nullable=False)  # cash, bank, check, card
    bank_account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=True)
    
    # Check Information
    check_number = db.Column(db.String(50), nullable=True)
    check_date = db.Column(db.Date, nullable=True)
    bank_name = db.Column(db.String(100), nullable=True)
    
    # Reference Information
    reference_type = db.Column(db.String(20), nullable=True)  # invoice, purchase, advance
    reference_id = db.Column(db.Integer, nullable=True)
    reference_number = db.Column(db.String(100), nullable=True)
    
    # Status
    status = db.Column(db.String(20), default='draft')  # draft, posted, cancelled
    
    # Additional Information
    description = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    
    # Currency
    currency = db.Column(db.String(3), default='SAR')
    exchange_rate = db.Column(db.Float, default=1.0)
    
    # User Information
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    posted_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    posted_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_payments', lazy=True)
    poster = db.relationship('User', foreign_keys=[posted_by], backref='posted_payments', lazy=True)
    bank_account = db.relationship('Account', backref='payments', lazy=True)
    
    def post(self, posted_by_user_id):
        """Post payment and create journal entry"""
        self.status = 'posted'
        self.posted_by = posted_by_user_id
        self.posted_at = datetime.utcnow()
        
        # Create journal entry
        journal_entry = JournalEntry(
            entry_number=JournalEntry.generate_entry_number(),
            entry_date=self.payment_date,
            description=f"{self.payment_type.title()} - {self.party_name}",
            reference_type='payment',
            reference_id=self.id,
            reference_number=self.payment_number,
            created_by=posted_by_user_id
        )
        
        db.session.add(journal_entry)
        db.session.flush()
        
        # Create journal entry lines
        if self.payment_type == 'receipt':
            # Debit: Cash/Bank Account
            debit_line = JournalEntryLine(
                journal_entry_id=journal_entry.id,
                account_id=self.bank_account_id or 1,  # Default cash account
                description=f"Receipt from {self.party_name}",
                debit_amount=self.amount,
                credit_amount=0
            )
            
            # Credit: Customer/Party Account
            credit_line = JournalEntryLine(
                journal_entry_id=journal_entry.id,
                account_id=self._get_party_account_id(),
                description=f"Receipt from {self.party_name}",
                debit_amount=0,
                credit_amount=self.amount
            )
        else:  # payment
            # Debit: Supplier/Party Account
            debit_line = JournalEntryLine(
                journal_entry_id=journal_entry.id,
                account_id=self._get_party_account_id(),
                description=f"Payment to {self.party_name}",
                debit_amount=self.amount,
                credit_amount=0
            )
            
            # Credit: Cash/Bank Account
            credit_line = JournalEntryLine(
                journal_entry_id=journal_entry.id,
                account_id=self.bank_account_id or 1,  # Default cash account
                description=f"Payment to {self.party_name}",
                debit_amount=0,
                credit_amount=self.amount
            )
        
        db.session.add(debit_line)
        db.session.add(credit_line)
        
        journal_entry.calculate_totals()
        journal_entry.post(posted_by_user_id)
        
        db.session.commit()
    
    def _get_party_account_id(self):
        """Get party account ID based on party type"""
        # This should be implemented based on your chart of accounts
        # For now, return default accounts
        if self.party_type == 'customer':
            return 2  # Accounts Receivable
        elif self.party_type == 'supplier':
            return 3  # Accounts Payable
        else:
            return 4  # Other Receivables/Payables
    
    def to_dict(self):
        """Convert payment object to dictionary"""
        return {
            'id': self.id,
            'payment_number': self.payment_number,
            'payment_date': self.payment_date.isoformat(),
            'payment_type': self.payment_type,
            'amount': self.amount,
            'party_type': self.party_type,
            'party_id': self.party_id,
            'party_name': self.party_name,
            'payment_method': self.payment_method,
            'bank_account_id': self.bank_account_id,
            'bank_account_name': self.bank_account.name if self.bank_account else None,
            'check_number': self.check_number,
            'check_date': self.check_date.isoformat() if self.check_date else None,
            'bank_name': self.bank_name,
            'reference_type': self.reference_type,
            'reference_id': self.reference_id,
            'reference_number': self.reference_number,
            'status': self.status,
            'description': self.description,
            'notes': self.notes,
            'currency': self.currency,
            'exchange_rate': self.exchange_rate,
            'created_by': self.created_by,
            'posted_by': self.posted_by,
            'created_at': self.created_at.isoformat(),
            'posted_at': self.posted_at.isoformat() if self.posted_at else None
        }
    
    @staticmethod
    def generate_payment_number(payment_type):
        """Generate next payment number"""
        prefix = 'RCP' if payment_type == 'receipt' else 'PAY'
        last_payment = Payment.query.filter_by(payment_type=payment_type).order_by(Payment.id.desc()).first()
        if last_payment:
            last_number = int(last_payment.payment_number.split('-')[1])
            return f"{prefix}-{str(last_number + 1).zfill(6)}"
        return f"{prefix}-000001"
    
    def __repr__(self):
        return f'<Payment {self.payment_number}: {self.amount}>'
