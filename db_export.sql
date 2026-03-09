--
-- PostgreSQL database dump
--

\restrict 6bhiC7v1vtowhe8gqizpNhvPWna8S4CM5csaL6RrpzHHL5RP8lp3HiMrxyV81Ys

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: athletes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.athletes (
    id character varying NOT NULL,
    name text NOT NULL,
    level text NOT NULL,
    competitive_system text NOT NULL,
    group_id character varying
);


--
-- Name: curriculum; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.curriculum (
    id character varying NOT NULL,
    program text NOT NULL,
    level text NOT NULL,
    event text NOT NULL,
    skill_id character varying NOT NULL,
    intro_date text,
    checkpoint_date text,
    mastery_target_date text,
    status text DEFAULT 'Not Started'::text,
    progress integer DEFAULT 0,
    notes text,
    athlete_ids text[]
);


--
-- Name: goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goals (
    id character varying NOT NULL,
    athlete_id character varying,
    title text NOT NULL,
    description text,
    timeframe text NOT NULL,
    linked_skill_ids text[],
    linked_event text,
    completed boolean DEFAULT false,
    progress integer DEFAULT 0,
    start_date text,
    target_date text
);


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id character varying NOT NULL,
    name text NOT NULL,
    description text,
    color text
);


--
-- Name: levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.levels (
    id character varying NOT NULL,
    name text NOT NULL,
    competitive_system text,
    "order" integer DEFAULT 0
);


--
-- Name: practices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.practices (
    id character varying NOT NULL,
    title text NOT NULL,
    description text,
    target_type text DEFAULT 'all'::text NOT NULL,
    athlete_ids text[],
    levels text[],
    group_name text,
    day_of_week text NOT NULL,
    vault_minutes integer DEFAULT 0,
    bars_minutes integer DEFAULT 0,
    beam_minutes integer DEFAULT 0,
    floor_minutes integer DEFAULT 0,
    skill_ids text[]
);


--
-- Name: routines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.routines (
    id character varying NOT NULL,
    athlete_id character varying NOT NULL,
    name text NOT NULL,
    event text NOT NULL,
    skill_ids text[] NOT NULL,
    start_value real DEFAULT 0,
    cr_fulfilled boolean DEFAULT false,
    cv_bonus real DEFAULT 0,
    group_bonus real DEFAULT 0,
    cr_bonus real DEFAULT 0
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


--
-- Name: skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skills (
    id character varying NOT NULL,
    name text NOT NULL,
    value text NOT NULL,
    event text NOT NULL,
    description text,
    vault_value real,
    skill_group text,
    cr_tags text[]
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Data for Name: athletes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.athletes (id, name, level, competitive_system, group_id) FROM stdin;
36673c13-af08-4245-8107-0ace62a5512e	Level 6 group	6	USA Gymnastics	422cf066-f021-4bbf-8996-462a23969fed
bfb60485-1747-456d-904a-68a1be569859	Charity LeGree	Jr. Elite	USA Gymnastics	\N
\.


--
-- Data for Name: curriculum; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.curriculum (id, program, level, event, skill_id, intro_date, checkpoint_date, mastery_target_date, status, progress, notes, athlete_ids) FROM stdin;
81389456-854a-48d8-babc-28a64b788d6f	Competitive	Elite	Bars	f5402d9b-9d86-469b-9228-30c48c4d97fc	2025-12-29	2026-01-12	2026-01-26	Introduced	25	\N	{bfb60485-1747-456d-904a-68a1be569859}
\.


--
-- Data for Name: goals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.goals (id, athlete_id, title, description, timeframe, linked_skill_ids, linked_event, completed, progress, start_date, target_date) FROM stdin;
acc53834-6cfb-4428-9f85-bc6c282c22ec	bfb60485-1747-456d-904a-68a1be569859	Qualify Elite Compulsory 	\N	Custom	{}	\N	f	0	2026-01-22	2026-01-22
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.groups (id, name, description, color) FROM stdin;
422cf066-f021-4bbf-8996-462a23969fed	Level 6 Group	\N	blue
\.


--
-- Data for Name: levels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.levels (id, name, competitive_system, "order") FROM stdin;
\.


--
-- Data for Name: practices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.practices (id, title, description, target_type, athlete_ids, levels, group_name, day_of_week, vault_minutes, bars_minutes, beam_minutes, floor_minutes, skill_ids) FROM stdin;
4ddf0a35-d775-4e59-a6d7-f8ceaaf41024	3  routines 	\N	all	\N	\N	\N	Monday	0	15	0	0	{}
6f682c97-5d2c-4d9d-a032-4f26056ed964	6 Maloney	\N	athletes	{bfb60485-1747-456d-904a-68a1be569859}	\N	\N	Monday	0	30	0	0	{}
\.


--
-- Data for Name: routines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.routines (id, athlete_id, name, event, skill_ids, start_value, cr_fulfilled, cv_bonus, group_bonus, cr_bonus) FROM stdin;
48891b36-5f80-4368-b9fc-24efc7b4cda6	bfb60485-1747-456d-904a-68a1be569859	Routines	Bars	{34975a8a-086f-4e04-8a6b-3427f25d104b,d2931d3b-6475-415b-af64-643d87e489d6,2c08f10e-d382-4ba2-bacf-309542ab28df,004f1a0d-1865-4465-8b0f-e66ade7ea934,34975a8a-086f-4e04-8a6b-3427f25d104b,bc3c2a66-7896-427b-acb4-41faa3f06465,dcc571cb-9e84-422a-92d7-4fb6c1a62740,34975a8a-086f-4e04-8a6b-3427f25d104b,d2931d3b-6475-415b-af64-643d87e489d6,fe2993fc-f11b-43e1-a796-599d68a65f3b,bf55ac2c-7ad0-48b3-9abc-a812ef2f83f8,34975a8a-086f-4e04-8a6b-3427f25d104b,d2931d3b-6475-415b-af64-643d87e489d6,1cd60deb-573d-4988-aa1a-b556637cb8f5,1cd60deb-573d-4988-aa1a-b556637cb8f5,240aedc0-6764-4e9e-b336-d37ed2cabe40}	4.2	f	0.1	0	1.5
d3510d75-50de-4e79-968a-9995f6cffc39	bfb60485-1747-456d-904a-68a1be569859	Charity Routine 2	Bars	{34975a8a-086f-4e04-8a6b-3427f25d104b,171ae56a-2cc9-4309-b0d1-9d37451f5540,2c08f10e-d382-4ba2-bacf-309542ab28df,b67ff5b9-9aef-4b13-8848-03371f1be37c,004f1a0d-1865-4465-8b0f-e66ade7ea934,d59e0d19-d752-414a-9572-9d269400aa40,b522486e-9c86-4ae8-beea-5bbc7c2cf46b,34975a8a-086f-4e04-8a6b-3427f25d104b,fe2993fc-f11b-43e1-a796-599d68a65f3b,bf55ac2c-7ad0-48b3-9abc-a812ef2f83f8,34975a8a-086f-4e04-8a6b-3427f25d104b,d2931d3b-6475-415b-af64-643d87e489d6,d2931d3b-6475-415b-af64-643d87e489d6,bc3c2a66-7896-427b-acb4-41faa3f06465,1cd60deb-573d-4988-aa1a-b556637cb8f5,1cd60deb-573d-4988-aa1a-b556637cb8f5,240aedc0-6764-4e9e-b336-d37ed2cabe40}	5.3	t	0.2	0	2
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (sid, sess, expire) FROM stdin;
TPoN4GRFeDMwwSE7GPUZHga554bpC4zT	{"cookie": {"path": "/", "secure": true, "expires": "2026-01-05T06:38:00.310Z", "httpOnly": true, "originalMaxAge": 604800000}, "replit.com": {"code_verifier": "gM5s0cOInpuV56T0eugwlnh-OkbE1PR1911fieR9mDQ"}}	2026-01-05 06:52:19
TVXg-MLYpHWNBK60m1zBFhXsAWLiHdZ0	{"cookie": {"path": "/", "secure": true, "expires": "2026-01-05T06:25:19.282Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "7bcdfc69-37b6-41ca-93eb-ee7f373220a1", "exp": 1766993119, "iat": 1766989519, "iss": "https://replit.com/oidc", "sub": "46265554", "email": "deshaun@tntgym.org", "at_hash": "3j86QCtwv3zyEjh-mbZx2g", "username": "deshaun1", "auth_time": 1766989518, "last_name": "Holden", "first_name": "DeShaun"}, "expires_at": 1766993119, "access_token": "5NthPr7EelJhNsFTpigEuz8sVOKtWx7AUbFmFlmFYpB", "refresh_token": "cKSvsmddmNr6LXDDrsuR23xUExbr37VG57hNQGBuV29"}}}	2026-01-05 06:57:26
3ylLfhjwa3evv5oKwHSlo7pEYXe2JWFK	{"cookie": {"path": "/", "secure": true, "expires": "2026-03-16T19:17:44.546Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "7bcdfc69-37b6-41ca-93eb-ee7f373220a1", "exp": 1773087464, "iat": 1773083864, "iss": "https://replit.com/oidc", "sub": "46265554", "email": "deshaun@tntgym.org", "at_hash": "tYizaDnuGbXiXE6vb54TWA", "username": "deshaun1", "auth_time": 1773083864, "last_name": "Holden", "first_name": "DeShaun", "email_verified": true}, "expires_at": 1773087464, "access_token": "EBhQmQ4K3p2V9WG4ptLs08VX2OhO2T1yrnsYp3ROeLq", "refresh_token": "RmgMI8wRwUhAF0h4y7-ZE7tvjWhzwDziG6ue0EaTRGK"}}}	2026-03-16 19:28:14
\.


--
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.skills (id, name, value, event, description, vault_value, skill_group, cr_tags) FROM stdin;
37ae388a-5b8a-48da-9d54-adcbcef01a19	Handspring forward	Vault	Vault	Group 1 basic vault	1.6	\N	\N
830a11da-b9e9-479e-b4c3-1472d94dcbf6	Handspring forward - 1/2 turn off	Vault	Vault	Group 1	2	\N	\N
28aed1df-a5d6-4e34-a21a-aeca988b33d6	Handspring forward - 1/1 turn off	Vault	Vault	Group 1	2.6	\N	\N
244fe95d-6b16-4012-b659-1e8174d7ea09	Handspring forward - 1.5/1 turn off (Kim)	Vault	Vault	Group 1	3.2	\N	\N
6cd62148-1480-4948-809c-47da39fd989d	Handspring forward - 2/1 turn off	Vault	Vault	Group 1	3.6	\N	\N
a07f506a-70dc-44f0-a8a2-86f8cba1491f	Handspring forward - 2.5/1 turn off	Vault	Vault	Group 1	4	\N	\N
85c1cc13-60a1-4e5a-ba82-6227f468acb4	Yamashita	Vault	Vault	Group 1	2	\N	\N
95e17013-529c-4319-9ae2-ff8e9ce7aa77	Yamashita with 1/2 turn off	Vault	Vault	Group 1	2.4	\N	\N
af94c859-7833-447a-a59b-7d5b151d7077	Yamashita with 1/1 turn off	Vault	Vault	Group 1	2.8	\N	\N
5684e984-30f9-4275-971a-ab8357c83c8a	Round-off	Vault	Vault	Group 1	1.6	\N	\N
a76d9881-b668-45aa-a001-35b020f8bb27	Round-off - 1/2 turn off	Vault	Vault	Group 1	2	\N	\N
fd3e5e7e-422f-4a4a-bfd3-6f05ef237279	Round-off - 1/1 turn off	Vault	Vault	Group 1	2.6	\N	\N
8404ec82-96f1-43ad-ac7c-637dbf9f9553	Handspring fwd 1/2 turn on - stretched fly off	Vault	Vault	Group 1	2.4	\N	\N
d8993d60-7a83-4a08-a0b9-64891928de73	Handspring fwd 1/2 turn on - 1/2 turn off	Vault	Vault	Group 1	2.8	\N	\N
7f0653bc-3ea9-42ed-9c74-1fcb52ed0210	Handspring fwd 1/2 turn on - 1/1 turn off (Omelianchik)	Vault	Vault	Group 1	3.4	\N	\N
0a6b3565-5d45-4d9d-95d9-0d89654e9cdc	Handspring fwd 1/1 turn on - 1/1 turn off	Vault	Vault	Group 1	3.8	\N	\N
778c2d60-d1f3-4b22-86e6-bcd9abcd5e4d	Handspring fwd on - tucked salto fwd off	Vault	Vault	Group 2	3	\N	\N
d974de79-a66b-4353-9118-5bbd6dbb4d0a	Handspring fwd on - piked salto fwd off	Vault	Vault	Group 2	3.4	\N	\N
634c60e5-f41e-4a44-913a-b675c6404026	Handspring fwd on - stretched salto fwd off	Vault	Vault	Group 2	4	\N	\N
a4eb5bd6-09fe-46b6-a12d-5cd4da088ccb	Handspring fwd on - tucked salto fwd with 1/2 twist off (Rulfova)	Vault	Vault	Group 2	3.6	\N	\N
034f63c2-e7d4-4e1a-8174-0562ac3b0f82	Handspring fwd on - stretched salto fwd with 1/2 twist off	Vault	Vault	Group 2	4.4	\N	\N
613754df-5b9f-4482-b09c-1a7fe9d41c9d	Handspring fwd on - stretched salto fwd with 1/1 twist off	Vault	Vault	Group 2	4.8	\N	\N
2fe1b647-9f4c-4b17-83fe-a0c197f5dda9	Handspring fwd on - tucked double salto fwd off	Vault	Vault	Group 2	5.2	\N	\N
15f05657-8e2a-47b7-bc47-b6b548126394	Handspring fwd 1/2 on - stretched salto bwd off (Cuervo)	Vault	Vault	Group 2 Cuervo	3.6	\N	\N
70db764e-e7da-4e85-a043-b38b7a80c8dd	Handspring fwd 1/2 on - stretched salto bwd with 1/2 twist off	Vault	Vault	Group 2 Cuervo	4	\N	\N
bb0a067b-a205-4ff6-8d81-b2efa6ed1c91	Handspring fwd 1/2 on - stretched salto bwd with 1/1 twist off (Podkopayeva)	Vault	Vault	Group 2	4.6	\N	\N
cb5f3100-ce18-4c32-b41a-11f26fc1492b	Handspring fwd 1/2 on - stretched salto bwd with 1.5/1 twist off	Vault	Vault	Group 2	5	\N	\N
3d972d71-1421-4a8e-acd9-3e27f06d44e9	Handspring fwd 1/2 on - stretched salto bwd with 2/1 twist off (Cheng)	Vault	Vault	Group 2 Cheng	5.4	\N	\N
633b70e3-b037-45bf-b78f-2de1aca95725	Tsukahara tucked	Vault	Vault	Group 3	2.8	\N	\N
9573942a-ec5d-4d76-a583-c9b82c8ca369	Tsukahara piked	Vault	Vault	Group 3	3.2	\N	\N
1851a0ee-c9d8-4ad4-8291-32c7e795bd74	Tsukahara stretched	Vault	Vault	Group 3	3.6	\N	\N
62b721d4-dd41-4d58-a8e9-0904fdb8b166	Tsukahara tucked with 1/1 twist off	Vault	Vault	Group 3	3.6	\N	\N
479a5d72-a632-45db-ab12-0401cc05df77	Tsukahara stretched with 1/1 twist off (Kasamatsu)	Vault	Vault	Group 3 Kasamatsu	4.4	\N	\N
e4656075-c068-4a71-8114-9bd8f40a0396	Tsukahara stretched with 1.5/1 twist off	Vault	Vault	Group 3	4.8	\N	\N
58a37de2-5fa3-437a-80bc-64aa0db20850	Tsukahara stretched with 2/1 twist off	Vault	Vault	Group 3	5.2	\N	\N
e57e846c-6e92-45fc-99c3-c952a4b71cc5	Tsukahara stretched with 2.5/1 twist off	Vault	Vault	Group 3	5.6	\N	\N
7591a73f-f863-4d00-8461-dd4f24645ed4	Tsukahara tucked double salto off	Vault	Vault	Group 3	5.6	\N	\N
6c924394-9533-42a8-9e41-30c402e6ae00	Yurchenko tucked	Vault	Vault	Group 4	2.8	\N	\N
2a9d8332-ddd0-41a9-b8a8-0ffb251dcf16	Yurchenko piked	Vault	Vault	Group 4	3.2	\N	\N
e7fa12f5-8994-4733-8233-80cd484356c2	Yurchenko stretched	Vault	Vault	Group 4	3.6	\N	\N
a09d478c-7aa2-4f8b-bbb1-e79e9a2dec30	Yurchenko tucked with 1/2 twist off	Vault	Vault	Group 4	3.2	\N	\N
325623c0-bf17-4f3c-a7b2-5583ee95ebd4	Yurchenko tucked with 1/1 twist off	Vault	Vault	Group 4	3.6	\N	\N
4d4ff413-f50d-4c78-9fae-899a54fef52d	Yurchenko stretched with 1/2 twist off	Vault	Vault	Group 4	4	\N	\N
4ec8877d-35ea-49de-a71f-256daadffeb8	Yurchenko stretched with 1/1 twist off	Vault	Vault	Group 4	4.4	\N	\N
e79cbbd0-a35f-4639-bd08-e22cbf52b38a	Yurchenko stretched with 1.5/1 twist off (Lopez)	Vault	Vault	Group 4	4.8	\N	\N
30452fcf-2b78-4b0a-9ffd-1674b1299419	Yurchenko stretched with 2/1 twist off (Amanar)	Vault	Vault	Group 4 Amanar	5.2	\N	\N
a34a133f-81dd-4063-90eb-170f4715f30f	Yurchenko stretched with 2.5/1 twist off (Biles)	Vault	Vault	Group 4 Biles	5.6	\N	\N
c9cdad01-d071-41ac-84bf-fc4506e64a4b	Yurchenko stretched with 3/1 twist off (Biles II)	Vault	Vault	Group 4 Biles II	6	\N	\N
660c8adb-82b3-4bdc-9715-cbd0e24c4f3a	Yurchenko tucked double salto off	Vault	Vault	Group 4	5.2	\N	\N
7d08e1df-d5d3-4527-a41f-a2e38208744f	Yurchenko piked double salto off	Vault	Vault	Group 4	5.6	\N	\N
d3982a19-4765-427b-bd30-32cda713e87e	Yurchenko stretched double salto off (Produnova)	Vault	Vault	Group 4 Produnova	6	\N	\N
88932c32-2c97-4265-bd05-24a51cef3e86	Round-off 1/2 on - tucked salto fwd off	Vault	Vault	Group 5	3.4	\N	\N
ec222135-ee44-4a25-822d-2a42b537d0cf	Round-off 1/2 on - piked salto fwd off	Vault	Vault	Group 5	3.8	\N	\N
4073c31a-8c57-411b-a8c8-c1c79b569b64	Round-off 1/2 on - stretched salto fwd off (Khorkina)	Vault	Vault	Group 5	4.4	\N	\N
50aa739b-4a5b-490c-9bf6-e3adee58e8a3	Round-off 1/2 on - stretched salto fwd with 1/2 twist off	Vault	Vault	Group 5	4.8	\N	\N
c5e7e704-2376-4f85-bf25-63d2701516ec	Round-off 1/2 on - stretched salto fwd with 1/1 twist off	Vault	Vault	Group 5	5.2	\N	\N
620bb733-a229-4741-945e-4ae4e0c1c92e	Round-off 1/2 on - tucked double salto fwd off	Vault	Vault	Group 5	5.4	\N	\N
4a488192-fdb7-4dd0-b6e2-ea128f4922fa	Round-off 1/2 on - stretched salto bwd off	Vault	Vault	Group 5	3.6	\N	\N
93cfd047-6f70-4a9c-bc28-45f6a21048ad	Round-off 1/2 on - stretched salto bwd with 1/1 twist off	Vault	Vault	Group 5	4.4	\N	\N
074400ca-625f-4c83-bd71-654968b50bd2	Round-off 1/2 on - stretched salto bwd with 1.5/1 twist off	Vault	Vault	Group 5	4.8	\N	\N
70ed6596-0c3b-45d6-acfb-23a891390ea9	Round-off 1/2 on - stretched salto bwd with 2/1 twist off	Vault	Vault	Group 5	5.2	\N	\N
34975a8a-086f-4e04-8a6b-3427f25d104b	Glide kip	A	Bars	\N	\N	Mounts	{}
236b4ead-1866-439d-bba1-2f7d8749e05d	Jump to hang on HB	A	Bars	\N	\N	Mounts	{}
c42ea13c-7639-439e-b730-dbe69c60e244	Jump to glide kip on LB	A	Bars	\N	\N	Mounts	{}
440c0e29-f957-4249-9a32-766625b284eb	Jump with 1/2 turn to hang on HB	A	Bars	\N	\N	Mounts	{}
98b24b79-9a67-4b40-b413-8aec18e7ef80	Jump to hstd on LB with hips bent	B	Bars	\N	\N	Mounts	{}
bdfcd750-3cd6-407a-a950-be689f2d4239	Jump to hstd on LB with 1/2 turn in hstd	B	Bars	\N	\N	Mounts	{}
8c45a7cc-bf20-43b9-95bb-6f938b3dc307	Jump with extended body to hstd on LB	C	Bars	\N	\N	Mounts	{}
7b821a42-db81-48f4-b59d-90ad1d11e142	Jump to hstd on LB with 1/1 turn in hstd	C	Bars	\N	\N	Mounts	{}
857ba25d-fb04-4599-bdf6-ff8892e2198f	Jump with extended body to hstd on LB with 1/1 turn (Maaranen)	D	Bars	\N	\N	Mounts	{}
e65ca1f2-cba3-4893-b5e4-6ddc8d4a29a6	Jump to clear support on HB - clear hip circle to hstd (McNamara)	D	Bars	\N	\N	Mounts	{}
d2931d3b-6475-415b-af64-643d87e489d6	Cast to hstd with legs straddled	A	Bars	\N	\N	Cast/Handstand	{}
171ae56a-2cc9-4309-b0d1-9d37451f5540	Cast to hstd with legs together	B	Bars	\N	\N	Cast/Handstand	{}
bc3c2a66-7896-427b-acb4-41faa3f06465	Cast with 1/2 turn to hstd	B	Bars	\N	\N	Cast/Handstand	{}
0fee62b8-5364-4cb1-be18-40aaff71abe8	Cast with 1/1 turn to hstd	C	Bars	\N	\N	Cast/Handstand	{non_flight_360_turn}
b1bdb703-a90e-4e1d-b8c9-8c0a216c1a10	Cast with 1.5/1 turn to hstd (Reeder)	D	Bars	\N	\N	Cast/Handstand	{non_flight_360_turn}
d59e0d19-d752-414a-9572-9d269400aa40	Clear hip circle to hstd	C	Bars	\N	\N	Cast/Handstand	{}
4949396f-4228-4222-bfb9-86382924e3d0	Clear hip circle with 1/2 turn to hstd	C	Bars	\N	\N	Cast/Handstand	{}
b67ff5b9-9aef-4b13-8848-03371f1be37c	Clear hip circle with 1/1 turn to hstd	D	Bars	\N	\N	Cast/Handstand	{non_flight_360_turn}
29d6ed21-dae5-4db5-9ea1-8dfac455f77e	Clear hip circle with 1.5/1 turn to hstd	E	Bars	\N	\N	Cast/Handstand	{non_flight_360_turn}
dfe96fa1-97d2-49fc-ad25-4515785e8ca9	Clear hip circle fwd to hstd (Weiler-kip)	D	Bars	\N	\N	Cast/Handstand	{}
ef665ef0-d11e-4f1b-9aa0-2a1c723d69df	Clear hip circle fwd with 1/1 turn to hstd (Godwin)	E	Bars	\N	\N	Cast/Handstand	{non_flight_360_turn}
248a50c2-b0da-42bd-a8d4-104066099760	Hip circle backward	A	Bars	\N	\N	Cast/Handstand	{}
e1cb9512-2b97-4201-885f-7a78fa0effe9	Hip circle forward	A	Bars	\N	\N	Cast/Handstand	{}
1cd60deb-573d-4988-aa1a-b556637cb8f5	Giant circle backward	B	Bars	\N	\N	Release Moves	{different_grips}
fe2993fc-f11b-43e1-a796-599d68a65f3b	Giant circle backward with 1/2 turn to hstd	B	Bars	\N	\N	Release Moves	{different_grips}
4d7ee38d-124f-4332-9a98-380302379e5c	Giant circle backward with 1/1 turn to hstd	C	Bars	\N	\N	Release Moves	{different_grips,non_flight_360_turn}
70afec6a-3f58-42fd-b52b-476227dfbc1b	Giant circle backward with 1.5/1 turn to hstd	D	Bars	\N	\N	Release Moves	{different_grips,non_flight_360_turn}
bfa80142-a535-4eca-8433-42d016f0b950	Giant circle backward with 2/1 turn to hstd (Chusovitina)	D	Bars	\N	\N	Release Moves	{different_grips,non_flight_360_turn}
be8165e2-e75c-451f-b91d-47fa9bb522ad	Giant circle forward	B	Bars	\N	\N	Release Moves	{different_grips}
d6068936-75d2-44e9-86a0-9e8d72e21b6f	Giant circle forward with 1/2 turn to hstd	B	Bars	\N	\N	Release Moves	{different_grips}
47575997-1b53-4a77-a41a-761cedb05437	Giant circle forward with 1/1 turn to hstd	C	Bars	\N	\N	Release Moves	{different_grips,non_flight_360_turn}
5713cdf3-30b3-477e-a844-79b3fe07aaa7	Giant circle forward with 1.5/1 turn to hstd	E	Bars	\N	\N	Release Moves	{different_grips,non_flight_360_turn}
4ad18884-7b46-46c4-9899-8f807388c98b	Tkatchev straddled (Davydova)	D	Bars	\N	\N	Release Moves	{same_bar_flight}
3be84431-0090-4154-b830-8da703eac0da	Tkatchev piked	E	Bars	\N	\N	Release Moves	{same_bar_flight}
74fbd593-81d8-4328-a3fb-f3a2f26ca511	Tkatchev with 1/2 turn (Kononenko)	D	Bars	\N	\N	Release Moves	{same_bar_flight}
3415f90e-0922-4cc6-b609-75b7a36b992a	Tkatchev with 1/2-1/2 turn (Shushunova)	E	Bars	\N	\N	Release Moves	{same_bar_flight}
84c7199a-d7a9-4543-bcf8-f488cd91a864	Jaeger salto tucked	C	Bars	\N	\N	Release Moves	{same_bar_flight}
bf55ac2c-7ad0-48b3-9abc-a812ef2f83f8	Jaeger salto straddled	D	Bars	\N	\N	Release Moves	{same_bar_flight}
f6b8bd43-004a-49d4-861e-73d1a863b05a	Jaeger salto piked	D	Bars	\N	\N	Release Moves	{same_bar_flight}
f2cb2daa-bdaa-4683-b8a6-8ede2e946bf9	Jaeger salto stretched (Capuccitti)	E	Bars	\N	\N	Release Moves	{same_bar_flight}
2f4dd734-91cb-40b1-9fdf-4e8f709b3666	Jaeger salto stretched with 1/1 turn (Yang)	F	Bars	\N	\N	Release Moves	{same_bar_flight}
03a799e9-39c7-4136-a2ab-7391dc47d02e	Gienger salto	D	Bars	\N	\N	Release Moves	{same_bar_flight}
227c9500-7c67-4531-865b-1ba87423927f	Deltchev salto straddled (Moreno/Nakamura)	D	Bars	\N	\N	Release Moves	{same_bar_flight}
004f1a0d-1865-4465-8b0f-e66ade7ea934	Pak salto	D	Bars	\N	\N	Release Moves	{hb_to_lb_flight}
cceca9b0-beb2-4c54-a928-6076f6ec6e96	Pak salto with 1/1 turn (Bhardwaj)	E	Bars	\N	\N	Release Moves	{hb_to_lb_flight}
2c08f10e-d382-4ba2-bacf-309542ab28df	Shaposhnikova	D	Bars	\N	\N	Release Moves	{hb_to_lb_flight}
0b1c17cd-3d1c-42dd-9cfb-114e37d9f66f	Shaposhnikova with 1/2 turn (Khorkina)	E	Bars	\N	\N	Release Moves	{hb_to_lb_flight}
ebded5c6-b50d-4da3-a59b-70d5a7d5e18c	Hindorff (counter straddle over HB)	E	Bars	\N	\N	Release Moves	{same_bar_flight}
54046c63-4fdc-4363-891c-b0899ac980fb	Clear hip circle counter pike over HB (Shang)	F	Bars	\N	\N	Release Moves	{same_bar_flight}
aeab12f1-89bf-4e06-acf3-14dc4eb3b61e	Stalder circle backward to hstd	C	Bars	\N	\N	Release Moves	{}
4d389958-5a96-4152-a804-3f8136a7ea6f	Stalder circle with 1/1 turn to hstd (Kim)	D	Bars	\N	\N	Release Moves	{non_flight_360_turn}
9ba815fd-b748-4b62-9abe-211c8e9fedd2	Stalder circle to Tkatchev (Tweddle)	E	Bars	\N	\N	Release Moves	{same_bar_flight}
1a4fb24b-dde8-41f1-ad67-c8255551374e	Stalder to Shaposhnikova (Chow)	E	Bars	\N	\N	Release Moves	{hb_to_lb_flight}
8eeb8c28-3e7b-4beb-8106-40888db21937	Toe-on circle to hstd	C	Bars	\N	\N	Cast/Handstand	{}
649bb463-c730-414a-846f-806ba303e3e3	Toe-on circle with 1/1 turn to hstd	D	Bars	\N	\N	Cast/Handstand	{non_flight_360_turn}
ab309265-fbd9-4865-a939-4d4d67ddaef1	Toe-on to Pak salto (He Kexin)	E	Bars	\N	\N	Release Moves	{hb_to_lb_flight}
b866bed4-5edb-4388-a811-830dd0e40819	Flyaway tucked	A	Bars	\N	\N	Dismounts	{}
ba5a5809-65e3-46cf-9a03-238c12c26fc8	Flyaway stretched	B	Bars	\N	\N	Dismounts	{}
e0c0630c-6b4c-4813-9d70-d9ec22d8cb35	Flyaway stretched with 1/1 twist	C	Bars	\N	\N	Dismounts	{}
7b909189-f34c-495b-b1c7-d81566821e89	Flyaway stretched with 1.5/1 twist	C	Bars	\N	\N	Dismounts	{}
ac924bee-64e1-4406-a48b-746aff94b2db	Flyaway stretched with 2/1 twist	D	Bars	\N	\N	Dismounts	{}
3e16cef0-cada-454d-ab77-e197bb0ee2ce	Flyaway stretched with 2.5/1 twist	D	Bars	\N	\N	Dismounts	{}
1a31d89b-930e-4ec7-be58-4cc3beb5afc1	Flyaway stretched with 3/1 twist	E	Bars	\N	\N	Dismounts	{}
c8081f3d-3e9b-4462-9513-154c8476d6b7	Double salto backward tucked	D	Bars	\N	\N	Dismounts	{}
4798480e-c84b-4f3c-8acc-55a5cf08d368	Double salto backward piked	D	Bars	\N	\N	Dismounts	{}
240aedc0-6764-4e9e-b336-d37ed2cabe40	Double salto backward stretched	E	Bars	\N	\N	Dismounts	{}
6db2762f-f643-4e11-aee5-a331d85e0569	Double salto backward tucked with 1/1 twist	E	Bars	\N	\N	Dismounts	{}
449a3c85-a004-4c2d-a2ef-25c403813ca3	Double salto backward stretched with 1/1 twist	F	Bars	\N	\N	Dismounts	{}
fd7034be-176a-416f-9500-3de9644a8927	Double salto backward stretched with 2/1 twist (Mustafina)	G	Bars	\N	\N	Dismounts	{}
b4d69c6c-3856-42b8-87d8-229859201f17	Double salto forward tucked	D	Bars	\N	\N	Dismounts	{}
d5eaf724-e0cd-4ecb-aca3-2243045a6b34	Double salto forward piked	E	Bars	\N	\N	Dismounts	{}
ffaf85a4-53c6-4f0b-970f-843a48e30866	Salto fwd stretched with 1/1 twist	C	Bars	\N	\N	Dismounts	{}
4cc9bc0c-2d2f-4618-9ae7-f9e21ce8fa01	Salto fwd stretched with 2/1 twist	D	Bars	\N	\N	Dismounts	{}
dafb3951-2c32-4201-8bdd-f8e31c3aa506	Jump to squat on beam	A	Beam	\N	\N	Mounts	{}
74126fe5-ed6d-40c9-a50a-faa4937745a6	Jump to straddle on beam	A	Beam	\N	\N	Mounts	{}
a4748e92-44a8-42d0-9b1e-ebf15f4980a1	Jump to front support	A	Beam	\N	\N	Mounts	{}
c05f9165-48af-409a-837a-b4704a34049f	Jump with 1/2 turn to squat on beam	A	Beam	\N	\N	Mounts	{}
6ffac012-df21-46bf-ab7b-778e8c5ef0db	Squat on - jump to stand	A	Beam	\N	\N	Mounts	{}
b614bc54-17d7-4dcb-936b-e6200e73ffc0	Straddle mount	A	Beam	\N	\N	Mounts	{}
8be0355e-4b33-4292-957c-39f720705dec	Wolf mount	A	Beam	\N	\N	Mounts	{}
c2b1861b-9f02-4757-bee0-f701971ef449	Press to handstand mount	B	Beam	\N	\N	Mounts	{}
ccb95fbb-6838-4094-82b7-feb7297b0726	Jump to cross handstand mount	B	Beam	\N	\N	Mounts	{}
21f56060-16c5-4b2e-af7f-a78d3359d383	Handspring mount	B	Beam	\N	\N	Mounts	{}
41c93823-d0ae-4b51-a089-f46322be1488	Round-off mount	B	Beam	\N	\N	Mounts	{}
1a7741a3-d46e-4675-890f-a17ea0ee1600	Aerial cartwheel mount	C	Beam	\N	\N	Mounts	{acro_directions}
ad7606c9-21d7-44bf-b216-2f71d8636b81	Aerial walkover mount	C	Beam	\N	\N	Mounts	{}
5cbd177d-de08-43f1-9436-7ab16fff90bb	Front salto tucked mount	C	Beam	\N	\N	Mounts	{acro_directions}
6ec4513a-0228-46d4-acd9-291daaa27fda	Front salto piked mount	D	Beam	\N	\N	Mounts	{acro_directions}
83dc38c8-88c8-4a70-9461-4e6877ad937d	Front salto stretched mount	D	Beam	\N	\N	Mounts	{acro_directions}
b718b77b-b291-4ef7-8e09-3052032acfc4	Back salto tucked mount	C	Beam	\N	\N	Mounts	{}
0bc81b7d-6b53-46d8-961d-c93a502c4665	Back salto stretched mount	D	Beam	\N	\N	Mounts	{}
f70b07d4-2521-421d-9b90-785d72a77fa3	Back salto stretched with 1/1 twist mount	E	Beam	\N	\N	Mounts	{}
c5871c02-08e0-4728-8473-eafb76d65b62	Round-off flic-flac mount	C	Beam	\N	\N	Mounts	{}
d0374133-d70e-459f-8e12-9fa0f58acb82	Round-off back salto stretched mount	D	Beam	\N	\N	Mounts	{}
6f8848a8-83fd-4b22-adac-b5439096cd69	Straight jump	A	Beam	\N	\N	Dance/Leaps	{}
362574ae-aaf8-4734-a99e-575f21a08c6c	Split jump	A	Beam	\N	\N	Dance/Leaps	{dance_connection}
2302a273-6cf8-47f5-8442-df2fba990f49	Split leap	A	Beam	\N	\N	Dance/Leaps	{dance_connection}
7a18c905-2b42-48d5-bc19-2122130c8a9b	Straddle jump	A	Beam	\N	\N	Dance/Leaps	{dance_connection}
1d356aea-6718-4db7-8ff7-efaa67af0f1f	Tuck jump	A	Beam	\N	\N	Dance/Leaps	{}
49abacd9-0a35-4b3e-8f34-e82889df006e	Wolf jump	A	Beam	\N	\N	Dance/Leaps	{}
1860ff43-0646-4159-a911-31e9d1b6a295	Cat leap	A	Beam	\N	\N	Dance/Leaps	{}
0d3bfe20-affa-4249-9498-baa2218d36f1	Sissone	A	Beam	\N	\N	Dance/Leaps	{}
a7c7a8af-462d-47fd-b5a7-6e337477e206	Split jump with 1/2 turn	B	Beam	\N	\N	Dance/Leaps	{dance_connection}
7f445ad4-f0b5-47d3-a979-cfacf8c2f42c	Split leap with 1/2 turn	B	Beam	\N	\N	Dance/Leaps	{dance_connection}
3e926430-61a3-4862-9e7e-5ae4546a0602	Switch leap	C	Beam	\N	\N	Dance/Leaps	{dance_connection}
21731f27-4f88-4797-809a-45fdd372076b	Switch leap with 1/2 turn	D	Beam	\N	\N	Dance/Leaps	{dance_connection}
7eb2a0b4-5554-4d48-9d6b-e758fe5b853d	Switch leap with 1/1 turn	E	Beam	\N	\N	Dance/Leaps	{dance_connection}
9118ef68-f325-464f-b320-c67225a1afcc	Split jump with 1/1 turn	C	Beam	\N	\N	Dance/Leaps	{dance_connection}
9291bac2-534c-43b1-8194-d33a6aab05b6	Sheep jump	B	Beam	\N	\N	Dance/Leaps	{}
969f8774-cbd8-4dd3-9f07-c48d64b694b5	Ring leap	C	Beam	\N	\N	Dance/Leaps	{dance_connection}
dd61a4ee-3521-448c-a644-9785c7ff6f61	Switch ring leap	D	Beam	\N	\N	Dance/Leaps	{dance_connection}
15005e3a-0852-48da-9505-70115d1ee00e	Wolf jump with 1/1 turn	C	Beam	\N	\N	Dance/Leaps	{}
8d471400-ef84-4c84-9d2a-59c3490a184e	Wolf jump with 2/1 turn	D	Beam	\N	\N	Dance/Leaps	{}
7dd600bc-a591-468e-96a4-732bf6314db2	Side split leap	B	Beam	\N	\N	Dance/Leaps	{dance_connection}
c716f02a-705a-492b-9f30-5489a90916f9	Tour jete (split leap with 1/2 turn)	B	Beam	\N	\N	Dance/Leaps	{dance_connection}
db62daef-7b9e-4b01-97fb-7eda2def6d82	Johnson leap (switch side leap)	D	Beam	\N	\N	Dance/Leaps	{dance_connection}
f54c72a1-c1e2-4938-a36c-bdc97c0f310c	Pike jump	A	Beam	\N	\N	Dance/Leaps	{}
015edc6d-df09-4ee5-abbe-f6eb04635cca	1/1 turn (360°)	A	Beam	\N	\N	Dance/Leaps	{turn_or_roll}
01ff9d80-b42b-4d7a-a19b-140ebbb5aa11	1.5/1 turn (540°)	B	Beam	\N	\N	Dance/Leaps	{turn_or_roll}
d27ea325-4264-4549-8ac0-4b3c77f1adcf	2/1 turn (720°)	C	Beam	\N	\N	Dance/Leaps	{turn_or_roll}
543125f7-81fd-47be-9ce4-476a1f336fc1	2.5/1 turn (900°)	D	Beam	\N	\N	Dance/Leaps	{turn_or_roll}
658e3ed0-0d49-4209-82f0-262053096511	3/1 turn (1080°)	E	Beam	\N	\N	Dance/Leaps	{turn_or_roll}
ddd8382e-023a-4dc7-b365-fa1830a21e3e	L-turn 1/1 (360°)	B	Beam	\N	\N	Dance/Leaps	{turn_or_roll}
ffdb7db4-582c-4bd4-ad02-32907b038ecc	L-turn 2/1 (720°)	D	Beam	\N	\N	Dance/Leaps	{turn_or_roll}
c53a694a-dda2-4f8f-a2e3-0dfde32dbea4	Y-turn 1/1 (360°)	C	Beam	\N	\N	Dance/Leaps	{turn_or_roll}
951e9be7-9ac0-4615-a407-cee7da209dec	Y-turn 2/1 (720°)	E	Beam	\N	\N	Dance/Leaps	{turn_or_roll}
6909d79a-c702-42ed-8855-f1e541ce8921	Illusion turn	B	Beam	\N	\N	Dance/Leaps	{turn_or_roll}
10c3ba7c-7913-4d9f-8fd4-d07b1d4425eb	Back attitude turn 1/1 (360°)	B	Beam	\N	\N	Dance/Leaps	{turn_or_roll}
f13f9e72-3c0f-45c1-9406-cff4e9b0e401	Cartwheel	A	Beam	\N	\N	Acrobatic	{acro_directions}
2302e76a-def0-407b-9430-24271c23132e	Handstand	A	Beam	\N	\N	Acrobatic	{}
ac916b27-f3f6-480c-aa5a-1773eaad37e7	Forward walkover	A	Beam	\N	\N	Acrobatic	{acro_directions}
d29cf514-44e9-4739-b814-82f731de7c4a	Backward walkover	A	Beam	\N	\N	Acrobatic	{}
f5b7c0c2-eb01-4c4b-b39e-a08cb00f9b1e	Back handspring step-out	B	Beam	\N	\N	Acrobatic	{}
9b238c90-96b6-4a26-be2d-708e10706a08	Back handspring	B	Beam	\N	\N	Acrobatic	{acro_series}
58246f3c-b14f-4fe7-8e02-3ed1758abd74	Flic-flac (back handspring)	B	Beam	\N	\N	Acrobatic	{acro_series}
fe005e22-78be-4d5e-89b0-1a4082d39153	Front handspring	B	Beam	\N	\N	Acrobatic	{acro_directions,acro_series}
2bb65e50-f5ed-40b2-a956-9d0605613c70	Flic-flac with 1/1 turn	C	Beam	\N	\N	Acrobatic	{acro_series}
5a2ae53a-42a6-49d1-906d-4855889837c1	Front aerial	C	Beam	\N	\N	Acrobatic	{acro_directions,acro_series}
c46a9734-4806-4d8a-a93d-9ba509df5e1f	Side aerial	C	Beam	\N	\N	Acrobatic	{acro_directions,acro_series}
e8e6f00f-02ac-40dd-b321-98f9c82142b7	Back aerial (Flic without hands)	C	Beam	\N	\N	Acrobatic	{acro_series}
11cbf351-8861-43fa-9d68-d6e44e7f3ce8	Back salto tucked	C	Beam	\N	\N	Acrobatic	{acro_series}
a74d53bd-b7b6-4e09-be75-1c43096cf7bc	Back salto piked	D	Beam	\N	\N	Acrobatic	{acro_series}
7f9f211c-4f34-4254-9ad9-6815a2ff5079	Back salto stretched	D	Beam	\N	\N	Acrobatic	{acro_series}
256dc317-f1fa-47a2-9080-93040b72ebff	Back salto stretched with 1/2 twist	D	Beam	\N	\N	Acrobatic	{acro_series}
2e084572-4d48-4722-9ee1-71f44387473c	Back salto stretched with 1/1 twist	E	Beam	\N	\N	Acrobatic	{acro_series}
30257c84-2b02-438a-83d4-38402c5024ea	Back salto stretched with 2/1 twist	F	Beam	\N	\N	Acrobatic	{acro_series}
d7d6a355-dbc5-4257-8568-f44ff9575bb6	Front salto tucked	C	Beam	\N	\N	Acrobatic	{acro_directions,acro_series}
77df57a7-3288-4003-b2ea-00778cdd83e1	Front salto piked	D	Beam	\N	\N	Acrobatic	{acro_directions,acro_series}
01078a19-56d7-4f3e-ab24-661bcd78b129	Front salto stretched	D	Beam	\N	\N	Acrobatic	{acro_directions,acro_series}
b336a361-da50-47a5-8f2f-d7752c06dec6	Gainer salto tucked	D	Beam	\N	\N	Acrobatic	{acro_series}
1f6c3933-4b29-41e4-8922-d99fdc2203b7	Gainer salto stretched	E	Beam	\N	\N	Acrobatic	{acro_series}
71ecedd9-d689-4a29-9af8-6a3c6a8199da	Back layout step-out (Onodi prep)	C	Beam	\N	\N	Acrobatic	{acro_series}
3d0761a3-24b5-4fda-a27e-dcc18b924a1d	Onodi (Flic 1/2 to front layout)	D	Beam	\N	\N	Acrobatic	{acro_directions,acro_series}
c895ebb2-7463-4ae9-ba8f-d1cd500672e6	Standing back tuck	C	Beam	\N	\N	Acrobatic	{acro_series}
c6e704ad-2929-4ac3-a170-77c1aba30717	Cartwheel to side handstand 1/4 turn dismount	A	Beam	\N	\N	Dismounts	{}
bd7bd02c-1ddf-4b46-9495-351d74705885	Round-off dismount	A	Beam	\N	\N	Dismounts	{}
0f42987c-09f8-4e74-bca1-e944d89ba2a2	Back salto tucked dismount	B	Beam	\N	\N	Dismounts	{}
aa3d7460-07bc-4586-9d06-e97402d787e7	Back salto stretched dismount	C	Beam	\N	\N	Dismounts	{}
9e608dc2-5e39-4652-8b03-2e1dd9c5a3a8	Back salto stretched with 1/1 twist dismount	C	Beam	\N	\N	Dismounts	{}
e91f521e-383c-4da0-83b3-683f10c82212	Back salto stretched with 1.5/1 twist dismount	D	Beam	\N	\N	Dismounts	{}
3892c3ff-9dc2-459e-84dd-46e6d7f09bb9	Back salto stretched with 2/1 twist dismount	D	Beam	\N	\N	Dismounts	{}
b943c4b6-5732-4b28-909f-21ee6f7d2d38	Back salto stretched with 2.5/1 twist dismount	E	Beam	\N	\N	Dismounts	{}
7302b5f8-0dee-402f-9b16-3dca2d3f5e06	Back salto stretched with 3/1 twist dismount	E	Beam	\N	\N	Dismounts	{}
97d9b7ec-3060-4aba-9837-03d4bd36c723	Double back tucked dismount	D	Beam	\N	\N	Dismounts	{}
bc92b5cf-3db7-49e4-a790-7cbe4463631f	Double back piked dismount	E	Beam	\N	\N	Dismounts	{}
57b457f8-d501-44e2-ba6e-eca9d3140733	Double back stretched dismount	F	Beam	\N	\N	Dismounts	{}
5fd542e0-39de-4e13-a8c7-86d45ee22368	Double back tucked with 1/1 twist dismount	E	Beam	\N	\N	Dismounts	{}
3b9899e1-9ec1-4332-8f02-7534fe199d3a	Double back stretched with 1/1 twist dismount (Mustafina)	G	Beam	\N	\N	Dismounts	{}
00d40566-1143-4afb-9357-1de062cd3fc8	Gainer back salto stretched dismount	C	Beam	\N	\N	Dismounts	{}
94d66b55-4e13-4a55-ba57-94c685ba5bba	Gainer with 1/1 twist dismount	D	Beam	\N	\N	Dismounts	{}
4f23d7a3-99bf-46d7-bb70-1c0b99177e85	Gainer with 2/1 twist dismount	E	Beam	\N	\N	Dismounts	{}
0cbc6e84-8684-44ea-8e2b-b9e091517959	Side aerial dismount	B	Beam	\N	\N	Dismounts	{}
708bd5de-e01d-4c20-b6ce-7daa37d91028	Front salto tucked dismount	B	Beam	\N	\N	Dismounts	{}
e661b776-7c9b-4eb5-86dc-0b9891dc5c3a	Front salto stretched dismount	C	Beam	\N	\N	Dismounts	{}
c0532b9d-7f5d-4dca-b002-4ebfa8382103	Front salto stretched with 1/2 twist dismount	C	Beam	\N	\N	Dismounts	{}
4a2395eb-c544-4f87-aa02-21116e48c65a	Front salto stretched with 1/1 twist dismount	D	Beam	\N	\N	Dismounts	{}
67abd6ab-87f0-4899-9242-dc8cf97617a0	Double front tucked dismount	E	Beam	\N	\N	Dismounts	{}
9565528b-3446-4fba-bd56-60bd50591f81	Arabian double front tucked dismount	F	Beam	\N	\N	Dismounts	{}
3b1aaa5c-26be-4a30-9cd2-b8d72d6ff12b	Straight jump	A	Floor	\N	\N	Dance/Leaps	{}
6bb499fc-0c7a-4382-88bd-c5eef2040813	Split jump	A	Floor	\N	\N	Dance/Leaps	{dance_passage}
918dbca4-c0f9-4852-bdf3-75465a1ba2c4	Split leap	A	Floor	\N	\N	Dance/Leaps	{dance_passage}
da9f7f55-5cdd-4535-874a-df5d56671157	Straddle jump	A	Floor	\N	\N	Dance/Leaps	{dance_passage}
53393b2e-986b-46f3-9ba3-1399bf60600b	Tuck jump	A	Floor	\N	\N	Dance/Leaps	{}
c836edad-5773-4e2f-8486-de9a23224a62	Wolf jump	A	Floor	\N	\N	Dance/Leaps	{}
aefb08dd-6f8f-4f20-ae06-2589d4bb4963	Cat leap	A	Floor	\N	\N	Dance/Leaps	{}
aba9e2e4-226f-4b8c-afe0-8131587dd6cf	Sissone	A	Floor	\N	\N	Dance/Leaps	{}
ad24f888-021a-46ab-8cb9-507204c3bf4d	Split jump with 1/2 turn	A	Floor	\N	\N	Dance/Leaps	{dance_passage}
6666b10e-2739-4799-90b5-c5de0e613890	Split leap with 1/2 turn	A	Floor	\N	\N	Dance/Leaps	{dance_passage}
8c5d5dee-5029-40aa-a472-879e88fc5078	Split jump with 1/1 turn	B	Floor	\N	\N	Dance/Leaps	{dance_passage}
7c24c811-b4b3-40e0-8b69-7299db8e3921	Split leap with 1/1 turn	B	Floor	\N	\N	Dance/Leaps	{dance_passage}
d2b1b88a-e7f3-4d7b-bb8c-3cdde7c4df3d	Split leap with 2/1 turn	D	Floor	\N	\N	Dance/Leaps	{dance_passage}
bca2ac5e-6fa7-44f5-9fbb-a1b0ba777272	Switch leap	B	Floor	\N	\N	Dance/Leaps	{dance_passage}
f43c6972-42c8-45d6-b8f4-24fb4886373e	Switch leap with 1/2 turn	C	Floor	\N	\N	Dance/Leaps	{dance_passage}
9d8bb1ad-c064-408d-80b4-076764a94397	Switch leap with 1/1 turn	D	Floor	\N	\N	Dance/Leaps	{dance_passage}
f49d1053-3508-45e4-bd86-cc59874bbaa0	Ring leap	C	Floor	\N	\N	Dance/Leaps	{dance_passage}
407310ea-20d5-406c-a881-99e0bad2c4b1	Switch ring leap	D	Floor	\N	\N	Dance/Leaps	{dance_passage}
c83c9fc7-285b-4112-be54-4f1667c7f277	Sheep jump	B	Floor	\N	\N	Dance/Leaps	{}
567fef2b-b552-4e9b-bf11-8ed37b461cda	Wolf jump with 1/1 turn	A	Floor	\N	\N	Dance/Leaps	{}
a940b10c-674b-41c9-8acd-6820b8eabf8c	Wolf jump with 2/1 turn	B	Floor	\N	\N	Dance/Leaps	{}
ac8b1f65-661b-43ff-ae3c-b81b94d5b044	Straddle pike jump with 1/2 turn	A	Floor	\N	\N	Dance/Leaps	{dance_passage}
e356b641-2a1a-47d3-9899-588dd6017f06	Straddle pike jump with 1/1 turn	B	Floor	\N	\N	Dance/Leaps	{dance_passage}
b5394cd2-3742-4770-abbc-ec80983cd202	Tour jete (split leap with 1/2 turn)	A	Floor	\N	\N	Dance/Leaps	{dance_passage}
4b285f5d-231a-42c7-beae-d5b155c38d36	Tour jete with 1/1 turn	C	Floor	\N	\N	Dance/Leaps	{dance_passage}
ed21c9c2-39e0-4ae0-9d6c-1238b62c747b	Johnson leap (switch side leap)	D	Floor	\N	\N	Dance/Leaps	{dance_passage}
b74b8452-29e2-49b9-9a35-1c3a09ec4968	Side split leap	A	Floor	\N	\N	Dance/Leaps	{dance_passage}
564600e2-6af6-4bf7-a605-b1a2a417dd64	Pike jump	A	Floor	\N	\N	Dance/Leaps	{}
8cfb249f-83f8-41b4-8411-dbd2c32458ce	1/1 turn (360°)	A	Floor	\N	\N	Dance/Leaps	{}
1cd7cfe2-08ea-4487-88a7-1d8b74c73c8d	2/1 turn (720°)	B	Floor	\N	\N	Dance/Leaps	{}
52b361ac-1beb-4efd-95c4-e0b1d7761858	3/1 turn (1080°)	C	Floor	\N	\N	Dance/Leaps	{}
0b1a4933-3353-4e8c-a483-df46ee61ace4	4/1 turn (1440°)	D	Floor	\N	\N	Dance/Leaps	{}
343a8e1c-6f97-4e25-b18c-5979467b1064	L-turn 1/1 (360°)	A	Floor	\N	\N	Dance/Leaps	{}
19771ef9-e455-4744-b75b-4b39f6d0a3f3	L-turn 2/1 (720°)	C	Floor	\N	\N	Dance/Leaps	{}
326d2a96-c67d-41ba-9884-417c4f5c5645	Y-turn 1/1 (360°)	B	Floor	\N	\N	Dance/Leaps	{}
3144c49d-a95b-4db6-89e3-b7423efb9451	Y-turn 2/1 (720°)	D	Floor	\N	\N	Dance/Leaps	{}
788b7beb-6ec8-499e-8c67-a64510ddb9ff	Illusion turn	A	Floor	\N	\N	Dance/Leaps	{}
9a602399-5614-446b-b76e-b01cc4671046	Back attitude turn 1/1 (360°)	A	Floor	\N	\N	Dance/Leaps	{}
d31bdc5a-e066-41e7-94ef-1055f7ca8d2b	Wolf turn 2/1	B	Floor	\N	\N	Dance/Leaps	{}
213e8e69-1452-45e2-b4b1-96419942b181	Wolf turn 3/1	C	Floor	\N	\N	Dance/Leaps	{}
2828dd81-d9db-42c2-8c7f-7800b97d3fa6	Wolf turn 4/1	D	Floor	\N	\N	Dance/Leaps	{}
7c4b7d6e-f80e-4473-a3ff-1fe4f98d627c	Forward roll	A	Floor	\N	\N	Forward Tumbling	{}
447151fe-50d0-45cb-a273-d13ebbea69ed	Handstand forward roll	A	Floor	\N	\N	Forward Tumbling	{}
c5f3e7a0-d69b-45a3-903b-0188d9f46ff8	Front walkover	A	Floor	\N	\N	Forward Tumbling	{}
f1efad5e-6cc1-4980-8a4e-c79f3ce76775	Front handspring	A	Floor	\N	\N	Forward Tumbling	{}
5c3b1db9-cf41-4fe9-ad29-cef2865bbd6f	Front aerial	B	Floor	\N	\N	Forward Tumbling	{salto_bwd_fwd}
100444b3-9e69-4220-8568-ea06bcfe3720	Front salto tucked	A	Floor	\N	\N	Forward Tumbling	{salto_bwd_fwd}
5b8867de-4e22-4141-9eed-c7e21018c560	Front salto piked	B	Floor	\N	\N	Forward Tumbling	{salto_bwd_fwd}
4e0ec54f-4373-4040-b553-c3b4db038e23	Front salto stretched	C	Floor	\N	\N	Forward Tumbling	{salto_bwd_fwd}
f4e1288e-15d8-4595-bd27-18e85ca9167c	Front salto stretched with 1/2 twist	C	Floor	\N	\N	Forward Tumbling	{salto_bwd_fwd,salto_la_turn}
ddc7965f-f622-4541-91f1-6d72f270da1d	Front salto stretched with 1/1 twist	D	Floor	\N	\N	Forward Tumbling	{salto_bwd_fwd,salto_la_turn}
db56c104-1377-46bc-9ee2-04ea4e439f6b	Front salto stretched with 1.5/1 twist	D	Floor	\N	\N	Forward Tumbling	{salto_bwd_fwd,salto_la_turn}
d354c248-d2e2-4af6-b988-23cdb711f99c	Front salto stretched with 2/1 twist	E	Floor	\N	\N	Forward Tumbling	{salto_bwd_fwd,salto_la_turn}
2bbbb9e0-6647-41a3-8de4-2f160936e504	Double front tucked	D	Floor	\N	\N	Forward Tumbling	{salto_bwd_fwd,salto_double_ba}
101e3817-beb7-42fd-a1fc-545e780993d3	Double front piked	E	Floor	\N	\N	Forward Tumbling	{salto_bwd_fwd,salto_double_ba}
76323c2a-9e43-48df-a24d-0719f9726bc0	Double front stretched	F	Floor	\N	\N	Forward Tumbling	{salto_bwd_fwd,salto_double_ba}
23af9753-8246-4b74-b136-21b2fb4724eb	Arabian double front tucked	E	Floor	\N	\N	Forward Tumbling	{salto_double_ba}
427bf83a-c1b1-4380-9124-abf582e05e34	Arabian double front piked	F	Floor	\N	\N	Forward Tumbling	{salto_double_ba}
ec43d851-7546-470e-af4d-cccdac557cc0	Punch front tucked	A	Floor	\N	\N	Forward Tumbling	{salto_bwd_fwd}
25836499-47df-4203-870c-15dbf69d23f8	Punch front piked	B	Floor	\N	\N	Forward Tumbling	{salto_bwd_fwd}
4628e5d9-5c91-43f9-86bb-755570e8c37d	Punch front stretched	C	Floor	\N	\N	Forward Tumbling	{salto_bwd_fwd}
50cc1137-9d83-4e4a-b3e0-c73ae1fbe900	Backward roll	A	Floor	\N	\N	Backward Tumbling	{}
3b94cee9-8a3d-474e-92ab-ca4741a89a8d	Backward roll to handstand	A	Floor	\N	\N	Backward Tumbling	{}
3582ba6f-e36b-40d6-91af-310cce82d834	Back walkover	A	Floor	\N	\N	Backward Tumbling	{}
03b6e4da-4f26-4904-aa4e-363d44e52eb9	Round-off	A	Floor	\N	\N	Backward Tumbling	{}
41d75257-83ee-4248-b707-f43df92d6ce1	Flic-flac (back handspring)	A	Floor	\N	\N	Backward Tumbling	{}
b6c26d35-7a6a-4193-93f0-aa4d9980676e	Back salto tucked	A	Floor	\N	\N	Backward Tumbling	{}
62af5939-47ee-4149-b074-9292ee3f2ad5	Back salto piked	B	Floor	\N	\N	Backward Tumbling	{}
60f0fe49-d6c7-4a80-8621-baacb5c2d6e1	Back salto stretched	B	Floor	\N	\N	Backward Tumbling	{}
2b75a05c-e744-40ea-8fc3-7e9f4d20a4e6	Back salto stretched with 1/1 twist	B	Floor	\N	\N	Backward Tumbling	{salto_la_turn}
b49c28f5-f732-4949-9ed9-6507496d1350	Back salto stretched with 1.5/1 twist	C	Floor	\N	\N	Backward Tumbling	{salto_la_turn}
6d26c3cf-a641-485f-a624-7d906ebc7f0e	Back salto stretched with 2/1 twist (full-in)	C	Floor	\N	\N	Backward Tumbling	{salto_la_turn}
53d32932-34ea-486c-963b-095f2d5dc8ef	Back salto stretched with 2.5/1 twist	D	Floor	\N	\N	Backward Tumbling	{salto_la_turn}
2ce9ae25-34ec-4a66-9ed9-4f91c39b1e63	Back salto stretched with 3/1 twist	E	Floor	\N	\N	Backward Tumbling	{salto_la_turn}
bb1a5212-fd14-40d0-b81c-b1afdcc9e00e	Back salto stretched with 3.5/1 twist	E	Floor	\N	\N	Backward Tumbling	{salto_la_turn}
6a51e6ad-3589-4f3a-a81c-a001674a5855	Double back tucked	C	Floor	\N	\N	Backward Tumbling	{salto_double_ba}
b0ff2cdc-573b-464f-83bc-9f3dc11494b9	Double back piked	D	Floor	\N	\N	Backward Tumbling	{salto_double_ba}
37e5ea5b-0008-44af-b754-24391baa3ee5	Double back stretched	E	Floor	\N	\N	Backward Tumbling	{salto_double_ba}
36c3752f-aee0-45d0-8292-6891fef7039f	Double back tucked with 1/1 twist (full-in)	D	Floor	\N	\N	Backward Tumbling	{salto_double_ba,salto_la_turn}
90f4a442-a579-4df8-9b82-1cb1a730ade7	Double back piked with 1/1 twist (full-in piked)	E	Floor	\N	\N	Backward Tumbling	{salto_double_ba,salto_la_turn}
21ede87e-488d-4a37-afe5-63a4eff2193e	Double back tucked with 2/1 twist (double-full)	E	Floor	\N	\N	Backward Tumbling	{salto_double_ba,salto_la_turn}
b57948b6-d4b1-4c5f-a261-1f8d37f0d28c	Double back stretched with 1/1 twist	F	Floor	\N	\N	Backward Tumbling	{salto_double_ba,salto_la_turn}
290ea235-663e-4a7a-b55c-f6b51ee174a6	Double back stretched with 2/1 twist (Silivas)	G	Floor	\N	\N	Backward Tumbling	{salto_double_ba,salto_la_turn}
de65a906-859c-4b2b-97e5-c9b689282c3c	Triple back tucked	G	Floor	\N	\N	Backward Tumbling	{salto_double_ba}
55775e67-7771-49c7-9050-0899598f5eff	Triple back piked (Biles)	H	Floor	\N	\N	Backward Tumbling	{salto_double_ba}
7ef7fd7b-501b-4df2-9e04-33395947cfa7	Whip back (tempo back)	A	Floor	\N	\N	Backward Tumbling	{}
57494572-f53b-4693-9f74-880ff9832f89	Back 1.5 tucked (dismount connection)	B	Floor	\N	\N	Dismounts	{}
312ae50f-870b-4f2b-beb0-5a498fc00d60	Back 1.5 stretched (dismount connection)	C	Floor	\N	\N	Dismounts	{}
0216716a-d692-48e3-9ec4-5effda59c07c	Back 1.5 stretched with 1/1 twist	D	Floor	\N	\N	Dismounts	{salto_la_turn}
c068d9a1-e520-44f9-8c01-cb3ef61d216f	Back 1.5 stretched with 2/1 twist (Rudi out)	E	Floor	\N	\N	Dismounts	{salto_la_turn}
f5402d9b-9d86-469b-9228-30c48c4d97fc	Endo circle to handstand	D	Bars	\N	\N	Cast/Handstand	{}
97b302d8-a596-41d8-9c8a-c26c7fc83a3e	Endo circle with 1/2 turn to handstand	D	Bars	\N	\N	Cast/Handstand	{}
68fca0ae-9c66-4af4-a808-4907e54b2d2c	Endo circle with 1/1 turn to handstand	E	Bars	\N	\N	Cast/Handstand	{non_flight_360_turn}
1eb15562-2c7f-4f24-9a8b-4b432265247a	Maloney (Shaposhnikova with 1/1 turn)	E	Bars	\N	\N	Release Moves	{hb_to_lb_flight}
b522486e-9c86-4ae8-beea-5bbc7c2cf46b	Maloney half (Shaposhnikova with 1/2 turn)	E	Bars	\N	\N	Release Moves	{hb_to_lb_flight}
f074cfda-2aa0-4148-9ca0-2a1abdf6035e	Inbar Endo to handstand	D	Bars	\N	\N	Cast/Handstand	{}
420f9540-d710-4a49-8ef1-9a0b8fec94d1	Endo to Tkatchev	F	Bars	\N	\N	Release Moves	{same_bar_flight}
0c8be5e7-aaaa-4f7b-af69-10ed7571a9f1	Clear hip to Tkatchev	E	Bars	\N	\N	Release Moves	{same_bar_flight}
3a38ac54-9f95-4adb-96fe-9dde6e48776a	Bail to handstand (low to high)	C	Bars	\N	\N	Release Moves	{hb_to_lb_flight}
dcc571cb-9e84-422a-92d7-4fb6c1a62740	Toe shoot to high bar	C	Bars	\N	\N	Release Moves	{hb_to_lb_flight}
29ed2130-3dd1-4409-a399-f3dc268514c7	Sole circle backward to handstand	C	Bars	\N	\N	Cast/Handstand	{}
5ee8c1ab-a52f-4f8d-830c-cc88c6fc0934	Sole circle forward to handstand	D	Bars	\N	\N	Cast/Handstand	{}
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, first_name, last_name, profile_image_url, created_at, updated_at) FROM stdin;
46265554	deshaun@tntgym.org	DeShaun	Holden	\N	2025-12-29 06:25:19.269391	2026-03-09 19:17:44.523
\.


--
-- Name: athletes athletes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.athletes
    ADD CONSTRAINT athletes_pkey PRIMARY KEY (id);


--
-- Name: curriculum curriculum_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curriculum
    ADD CONSTRAINT curriculum_pkey PRIMARY KEY (id);


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: levels levels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.levels
    ADD CONSTRAINT levels_pkey PRIMARY KEY (id);


--
-- Name: practices practices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.practices
    ADD CONSTRAINT practices_pkey PRIMARY KEY (id);


--
-- Name: routines routines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routines
    ADD CONSTRAINT routines_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- PostgreSQL database dump complete
--

\unrestrict 6bhiC7v1vtowhe8gqizpNhvPWna8S4CM5csaL6RrpzHHL5RP8lp3HiMrxyV81Ys

