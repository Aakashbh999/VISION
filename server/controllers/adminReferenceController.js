const pool = require("../config/db");
const catchAsync = require("../utils/catchAsync");

const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const handleTableCrud = (tableName, idColumn, columns) => {
  return {
    getAll: catchAsync(async (req, res) => {
      const result = await pool.query(
        `SELECT * FROM portal.${tableName} ORDER BY ${idColumn} ASC`
      );
      res.json(result.rows);
    }),

    create: catchAsync(async (req, res) => {
      const data = req.body;

      if (columns.includes('slug')) {
        const nameField = data.field_name || data.degree_code || data.role_name || data.club_name || data.name;
        if (nameField && !data.slug) {
          data.slug = generateSlug(nameField);
        }
      }

      const keys = Object.keys(data).filter(key => columns.includes(key));
      const values = keys.map(key => data[key]);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

      const query = `
        INSERT INTO portal.${tableName} (${keys.join(", ")})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await pool.query(query, values);
      res.status(201).json(result.rows[0]);
    }),

    update: catchAsync(async (req, res) => {
      const { id } = req.params;
      const data = req.body;

      if (columns.includes('slug') && data.slug === undefined) {
         const nameField = data.field_name || data.degree_code || data.role_name || data.club_name || data.name;
         if (nameField) {
             data.slug = generateSlug(nameField);
         }
      }

      const keys = Object.keys(data).filter(key => columns.includes(key));
      const values = keys.map(key => data[key]);
      const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(", ");

      const query = `
        UPDATE portal.${tableName}
        SET ${setClause}
        WHERE ${idColumn} = $1
        RETURNING *
      `;

      const result = await pool.query(query, [id, ...values]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Record not found" });
      }
      res.json(result.rows[0]);
    }),

    delete: catchAsync(async (req, res) => {
      const { id } = req.params;
      const result = await pool.query(
        `DELETE FROM portal.${tableName} WHERE ${idColumn} = $1 RETURNING *`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Record not found" });
      }
      res.json({ message: "Record deleted successfully" });
    })
  };
};

const itFieldsCols = ['slug', 'field_name', 'short_description', 'description_full', 'tech_stack_hint', 'demand_level', 'icon_name', 'is_public'];
exports.itFields = handleTableCrud('it_fields', 'id', itFieldsCols);

const degreesCols = ['slug', 'degree_code', 'full_name', 'university', 'duration', 'eligibility', 'focus_area', 'admission_process', 'is_public'];
exports.academicDegrees = handleTableCrud('academic_degrees', 'id', degreesCols);

const jobsCols = ['slug', 'role_name', 'salary_range', 'market_demand', 'key_skills', 'job_summary', 'description', 'is_public'];
exports.jobMarketInsights = handleTableCrud('job_market_insights', 'id', jobsCols);

const clubsCols = ['slug', 'club_name', 'location', 'institution', 'specialty', 'is_public', 'contact_info', 'website_url', 'facebook_url', 'linkedin_url', 'discord_url', 'github_url', 'description_full', 'logo_url', 'banner_url', 'founded_year'];
exports.itClubs = handleTableCrud('it_clubs', 'id', clubsCols);

exports.programs = handleTableCrud('programs', 'program_id', ['program_name']);

exports.tags = {
  getAll: catchAsync(async (req, res) => {
    const result = await pool.query(`SELECT * FROM portal.tags ORDER BY name ASC`);
    res.json(result.rows);
  }),
  create: catchAsync(async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Tag name is required" });

    const checkResult = await pool.query(
      `SELECT * FROM portal.tags WHERE LOWER(name) = LOWER($1)`,
      [name]
    );
    if (checkResult.rows.length > 0) {
      return res.status(409).json({ error: "Tag with this name already exists" });
    }

    const slug = generateSlug(name);
    const result = await pool.query(
      `INSERT INTO portal.tags (name, slug) VALUES ($1, $2) RETURNING *`,
      [name, slug]
    );
    res.status(201).json(result.rows[0]);
  }),
  update: catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Tag name is required" });

    const checkResult = await pool.query(
      `SELECT * FROM portal.tags WHERE LOWER(name) = LOWER($1) AND tag_id != $2`,
      [name, id]
    );
    if (checkResult.rows.length > 0) {
      return res.status(409).json({ error: "Tag with this name already exists" });
    }

    const slug = generateSlug(name);
    const result = await pool.query(
      `UPDATE portal.tags SET name = $1, slug = $2 WHERE tag_id = $3 RETURNING *`,
      [name, slug, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Tag not found" });
    res.json(result.rows[0]);
  }),
  delete: catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM portal.tags WHERE tag_id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Tag not found" });
    res.json({ message: "Tag deleted successfully" });
  })
};
