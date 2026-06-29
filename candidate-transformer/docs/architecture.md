# Architecture

```text
Source Upload
  -> Parser Layer
  -> Canonical Mapper
  -> Normalizer Layer
  -> Merge Engine
  -> Conflict Resolution Engine
  -> Confidence Engine
  -> Provenance Engine
  -> Projection Engine
  -> Schema Validation
  -> Final Output
```

The implementation uses adapters for source-specific parsing and common field observations for downstream logic. Each observation carries source, method, confidence, timestamp, and notes so the merge, confidence, provenance, and lineage views can explain every canonical value.
