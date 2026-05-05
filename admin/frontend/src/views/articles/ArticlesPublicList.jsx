import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axiosPublic from "@/lib/axios-public";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import PublicLayout from "@/components/public-layout";
import {
	Search,
	ChevronLeft,
	ChevronRight,
	Calendar,
	User,
	Tag,
	ArrowLeft,
} from "lucide-react";
const SITE_NAME = "VADMIN";
const SITE_URL = window.location.origin;

export default function ArticlesPublicList() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [articles, setArticles] = useState([]);
	const [categories, setCategories] = useState([]);
	const [tags, setTags] = useState([]);
	const [loading, setLoading] = useState(true);
	const [meta, setMeta] = useState({});

	const page = parseInt(t)(searchParams.get("page") || ")1");
	const search = searchParams.get("search") || ")";
	const categoryId = searchParams.get("category_id") || ")";
	const tagId = searchParams.get("tag_id") || ")";

	useEffect(() => {
		getCategories();
		getTags();
	}, []);

	useEffect(() => {
		getArticles();
	}, [page, search, categoryId, tagId]);

	const getArticles = () => {
		setLoading(true);
		axiosPublic
			.get("/public/articles", {
				params: {
					page,
					search,
					category_id: categoryId,
					tag_id: tagId,
				},
			})
			.then(({ data }) => {
				setArticles(data.data);
				setMeta(data.meta || {});
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
			});
	};

	const getCategories = () => {
		axiosPublic.get("/public/categories").then(({ data }) => {
			setCategories(data.data || []);
		});
	};

	const getTags = () => {
		axiosPublic.get("/public/tags").then(({ data }) => {
			setTags(data.data || []);
		});
	};

	const handleSearch = (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const newSearch = formData.get("search");
		const params = new URLSearchParams(searchParams);
		if (newSearch) {
			params.set("search", newSearch);
		} else {
			params.delete("search");
		}
		params.delete("page");
		setSearchParams(params);
	};

	const handleCategoryChange = (categoryId) => {
		const params = new URLSearchParams(searchParams);
		if (categoryId) {
			params.set("category_id", categoryId);
		} else {
			params.delete("category_id");
		}
		params.delete("page");
		setSearchParams(params);
	};

	const handleTagChange = (tagId) => {
		const params = new URLSearchParams(searchParams);
		if (tagId) {
			params.set("tag_id", tagId);
		} else {
			params.delete("tag_id");
		}
		params.delete("page");
		setSearchParams(params);
	};

	const clearFilters = () => {
		setSearchParams({});
	};

	const formatDate = (dateString) => {
		if (!dateString) return "";
		return new Date(dateString).toLocaleDateString(undefined, {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const renderPagination = () => {
		if (!meta.last_page || meta.last_page <= 1) return null;

		const pages = [];
		const startPage = Math.max(1, page - 2);
		const endPage = Math.min(meta.last_page, startPage + 4);
		const adjustedStartPage = Math.max(1, endPage - 4);

		for (let i = adjustedStartPage; i <= endPage; i++) {
			pages.push(
				<Button
					key={i}
					variant={page === i ? "default" : "outline"}
					size="sm"
					onClick={() => {
						const params = new URLSearchParams(searchParams);
						params.set("page", i);
						setSearchParams(params);
					}}
				>
					{i}
				</Button>
			);
		}
		return pages;
	};

	const hasFilters = search || categoryId || tagId;

	const pageTitle = search || categoryId || tagId
		? `${"Blog"}${search ? ` - "${search}"` : ""} | ${SITE_NAME}`
		: "Blog";

	const seo = {
		title: pageTitle,
		description: "Lee nuestros últimos artículos" || "Browse our latest articles and blog postts.",
		ogTitle: pageTitle,
		ogDescription: "Lee nuestros últimos artículos",
		ogType: "website",
		ogUrl: `${SITE_URL}/blog`,
	};

	return (
		<PublicLayout seo={seo}>
			<div className="min-h-screen bg-background">
				<div className="container mx-auto px-4 py-8 max-w-6xl">
					<Card className="shadow-xl border-0">
						<CardHeader className="pb-4">
							<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
								<div>
									<CardTitle className="text-3xl font-bold tracking-tight">
										{"Blog"}
									</CardTitle>
									<p className="text-muted-foreground mt-1">
										{"Lee nuestros últimos artículos"}
									</p>
								</div>
							</div>
						</CardHeader>
						<CardContent className="pb-6">
							<div className="mb-6 space-y-4">
								<form onSubmit={handleSearch} className="flex gap-2">
									<div className="relative flex-1 max-w-md">
										<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											type="search"
											name="search"
											placeholder={"Buscar artículos..."}
											className="pl-10"
											defaultValue={search}
										/>
									</div>
									<Button type="submit" variant="secondary">
										{"Buscar"}
									</Button>
								</form>

								<div className="flex flex-wrap gap-2">
									<select
										className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
										value={categoryId}
										onChange={(e) => handleCategoryChange(e.target.value)}
									>
										<option value="">{"Todas las Categorías"}</option>
										{categories.map((category) => (
											<option key={category.id} value={category.id}>
												{category.name}
											</option>
										))}
									</select>

									<select
										className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
										value={tagId}
										onChange={(e) => handleTagChange(e.target.value)}
									>
										<option value="">{"Todas las Etiquetas"}</option>
										{tags.map((tag) => (
											<option key={tag.id} value={tag.id}>
												{tag.name}
											</option>
										))}
									</select>

									{hasFilters && (
										<Button variant="ghost" size="sm" onClick={clearFilters}>
											<ArrowLeft className="mr-2 h-4 w-4" />
											{"Limpiar Filtros"}
										</Button>
									)}
								</div>
							</div>

							{loading ? (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{[1, 2, 3, 4, 5, 6].map((i) => (
										<Card key={i}>
											<Skeleton className="h-48 w-full rounded-t-lg" />
											<CardContent className="pt-4">
												<Skeleton className="h-6 w-3/4 mb-2" />
												<Skeleton className="h-4 w-full mb-1" />
												<Skeleton className="h-4 w-2/3" />
											</CardContent>
										</Card>
									))}
								</div>
							) : articles.length === 0 ? (
								<div className="text-center py-12">
									<p className="text-muted-foreground text-lg">
										{"No se encontraron artículos."}
									</p>
									{hasFilters && (
										<Button variant="link" onClick={clearFilters} className="mt-2">
											{"Limpiar Filtros"}
										</Button>
									)}
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{articles.map((article) => (
										<Card key={article.id} className="overflow-hidden flex flex-col">
											{article.cover_url ? (
												<Link to={`/articulos/${article.slug}`}>
													<img
														src={article.cover_url}
														alt={article.title}
														className="h-48 w-full object-cover transition-transform hover:scale-105"
													/>
												</Link>
											) : (
												<div className="h-48 bg-muted flex items-center justify-center">
													<span className="text-muted-foreground">
														{"Sin imagen"}
													</span>
												</div>
											)}
											<CardContent className="pt-4 flex-1">
												{article.category && (
													<Badge variant="outline" className="mb-2">
														{article.category.name}
													</Badge>
												)}
												<Link to={`/articulos/${article.slug}`}>
													<h2 className="text-xl font-semibold hover:text-primary transition-colors line-clamp-2 mb-2">
														{article.title}
													</h2>
												</Link>
												<p className="text-muted-foreground text-sm line-clamp-3 mb-4">
													{article.content?.replace(/<[^>]*>/g, "").substring(0, 150)}
													{article.content?.length > 150 ? "..." : ""}
												</p>
												{article.tags && article.tags.length > 0 && (
													<div className="flex flex-wrap gap-1">
														{article.tags.slice(0, 3).map((tag) => (
															<Badge key={tag.id} variant="secondary" className="text-xs">
																<Tag className="h-3 w-3 mr-1" />
																{tag.name}
															</Badge>
														))}
														{article.tags.length > 3 && (
															<Badge variant="secondary" className="text-xs">
																+{article.tags.length - 3}
															</Badge>
														)}
													</div>
												)}
											</CardContent>
											<CardFooter className="text-sm text-muted-foreground border-t pt-4">
												<div className="flex items-center gap-4">
													{article.author && (
														<span className="flex items-center gap-1">
															<User className="h-4 w-4" />
															{article.author.name}
														</span>
													)}
													{article.published_at && (
														<span className="flex items-center gap-1">
															<Calendar className="h-4 w-4" />
															{formatDate(article.published_at)}
														</span>
													)}
												</div>
											</CardFooter>
										</Card>
									))}
								</div>
							)}

							{meta.last_page > 1 && (
								<div className="flex items-center justify-center space-x-2 mt-8">
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											const params = new URLSearchParams(searchParams);
											params.set("page", page - 1);
											setSearchParams(params);
										}}
										disabled={page === 1}
									>
										<ChevronLeft className="h-4 w-4 mr-2" />
										{"Anterior"}
									</Button>
									<div className="flex items-center space-x-1">{renderPagination()}</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											const params = new URLSearchParams(searchParams);
											params.set("page", page + 1);
											setSearchParams(params);
										}}
										disabled={page === meta.last_page}
									>
										{"Siguiente"}
										<ChevronRight className="h-4 w-4 ml-2" />
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</PublicLayout>
	);
}
