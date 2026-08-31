from sqlalchemy import create_engine, text
engine = create_engine("postgresql://user:pass@localhost:5432/bytemedia")
with engine.connect() as conn:
    res = conn.execute(text("SELECT id, status FROM campaigns"))
    print(res.fetchall())
