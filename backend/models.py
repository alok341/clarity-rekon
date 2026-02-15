from sqlalchemy import Column, Integer, String, Float
from database import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)
    supplier = Column(String)
    amount = Column(Float)
