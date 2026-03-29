BEGIN
  FOR src IN 1..40 LOOP
    FOR dest IN 1..40 LOOP
      IF src != dest THEN
        BEGIN
          INSERT INTO ROUTE (source_station_id, destination_station_id) VALUES (src, dest);
        EXCEPTION
          WHEN DUP_VAL_ON_INDEX THEN
            NULL; 
        END;
      END IF;
    END LOOP;
  END LOOP;
END;
/
COMMIT;
