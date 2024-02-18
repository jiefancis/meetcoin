CREATE or replace FUNCTION generate_code() RETURNS trigger AS $emp_stamp$
  DECLARE
    chars text[] := '{0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z}';
    result text := '';
    i integer := 0;
    done bool;
	  length INTEGER := 6;
  BEGIN
      done := false;
      WHILE NOT done LOOP
        for i in 1..length loop
          result := result || chars[1+random()*(array_length(chars, 1)-1)];
        end loop;
        done := NOT exists(SELECT 1 FROM "referral_code" WHERE referral_code=result);
      END LOOP;
      NEW.referral_code := result;
      RETURN NEW;
  END;
$emp_stamp$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS "referral_code" (
  id UUID NOT NULL PRIMARY KEY,
  "referral_code" varchar(32) NOT NULL,
  create_ts BIGINT NOT NULL DEFAULT ROUND(EXTRACT(EPOCH FROM current_timestamp) * 1000)
);

CREATE TRIGGER code_trigger BEFORE INSERT ON "referral_code"
  FOR EACH ROW EXECUTE PROCEDURE generate_code();
CREATE INDEX idx_referral_code ON "referral_code"("referral_code");

COMMENT ON COLUMN "referral_code".id is '主键userId';
COMMENT ON COLUMN "referral_code".referral_code is '用户邀请码';
COMMENT ON COLUMN "referral_code".create_ts is '创建时间';
