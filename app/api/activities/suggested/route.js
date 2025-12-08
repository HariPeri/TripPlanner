import pool from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country");

    if (!country) {
      return Response.json({ error: "Missing country parameter" }, { status: 400 });
    }

    // Fetch suggested activities with categories
    const [rows] = await pool.query(
      `
      SELECT 
        a.activity_id,
        a.name,
        a.description,
        a.country_name,
        sa.popularity_rating,
        ac.category
      FROM activity a
      JOIN suggested_activity sa 
        ON a.activity_id = sa.activity_id
      LEFT JOIN activity_category ac
        ON a.activity_id = ac.activity_id
      WHERE a.country_name = ?
      ORDER BY sa.popularity_rating DESC, a.name ASC
      `,
      [country]
    );

    // Group categories under each activity_id
    const activityMap = {};

    rows.forEach(row => {
      if (!activityMap[row.activity_id]) {
        activityMap[row.activity_id] = {
          activity_id: row.activity_id,
          name: row.name,
          description: row.description,
          country: row.country_name,
          popularity: row.popularity_rating,
          categories: []
        };
      }
      if (row.category) {
        activityMap[row.activity_id].categories.push(row.category);
      }
    });

    // Convert map → array
    const activities = Object.values(activityMap);

    return Response.json({ success: true, activities });
  } catch (error) {
    console.error("Suggested activities fetch error:", error);
    return Response.json(
      { error: "Failed to fetch suggested activities" },
      { status: 500 }
    );
  }
}
