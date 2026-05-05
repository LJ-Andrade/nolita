import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axiosPublic from "@/lib/axios-public";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PublicLayout from "@/components/public-layout";
import {
	Calendar,
	User,
	Tag,
	ArrowLeft,
	Share2,
} from "lucide-react";
const SITE_NAME = "VADMIN";
const SITE_URL = window.location.origin;

export default function ArticlePublicView() {
	const { slug } = useParams();
	const navigate = useNavigate();
	const handleBack = () => {
		if (window.history.length > 1) {
			navigate(-1);
		} else {
			navigate('/blog');
		}
	};
	const [article, setArticle] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	const getArticle = () => {
		setLoading(true);
		setError(false);
		axiosPublic
			.get(`/public/articles/${slug}`)
			.then(({ data }) => {
				setArticle(data.data);
				setLoading(false);
			})
			.catch(() => {
				setError(true);
				setLoading(false);
			});
	};

	useEffect(() => {
		getArticle();
	}, [slug]);

	const formatDate = (dateString) => {
		if (!dateString) return "";
		return new Date(dateString).toLocaleDateString(undefined, {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const handleShare = () => {
		if (navigator.share) {
			navigator.share({
				title: article.title,
				url: window.location.href,
			});
		} else {
			navigator.clipboard.writeTexwindow.location.href;
		}
	};

	if (loading) {
		return (
			<PublicLayout>
				<div className="min-h-screen bg-background">
					<div className="container mx-auto px-4 py-8 max-w-4xl">
						<Skeleton className="h-8 w-32 mb-4" />
						<Skeleton className="h-12 w-3/4 mb-4" />
						<div className="flex gap-4 mb-8">
							<Skeleton className="h-6 w-24" />
							<Skeleton className="h-6 w-32" />
						</div>
						<Skeleton className="h-96 w-full mb-8" />
						<Skeleton className="h-4 w-full mb-2" />
						<Skeleton className="h-4 w-full mb-2" />
						<Skeleton className="h-4 w-full mb-2" />
						<Skeleton className="h-4 w-3/4 mb-2" />
					</div>
				</div>
			</PublicLayout>
		);
	}

	if (error || !article) {
		return (
			<PublicLayout>
				<div className="min-h-screen bg-background">
					<div className="container mx-auto px-4 py-8 max-w-4xl">
						<Button variant="ghost" onClick={handleBack} className="mb-4">
							<ArrowLeft className="mr-2 h-4 w-4" />
							{"Volver"}
						</Button>
						<div className="text-center py-12">
							<h1 className="text-2xl font-bold mb-2">
								{"Artículo No Encontrado"}
							</h1>
							<p className="text-muted-foreground mb-4">
								{"El artículo que buscas no existe o ha sido eliminado."}
							</p>
							<Button asChild>
								<Link to="/blog">{"Ir al Blog"}</Link>
							</Button>
						</div>
					</div>
				</div>
			</PublicLayout>
		);
	}

	const articleDescription = article.content?.replace(/<[^>]*>/g, "").substring(0, 160) || "";
	const articleUrl = `${SITE_URL}/articles/${article.slug}`;

	const seo = {
		title: `${article.title} | ${SITE_NAME}`,
		description: articleDescription,
		keywords: article.tags?.map(t => t.name).join(", ") || "",
		ogTitle: article.title,
		ogDescription: articleDescription,
		ogType: "article",
		ogUrl: articleUrl,
		ogImage: article.cover_url || "",
		canonical: articleUrl,
	};

	return (
		<PublicLayout seo={seo}>
			<div className="min-h-screen bg-background">
				<div className="container mx-auto px-4 py-8 max-w-4xl">
					<Button variant="ghost" onClick={handleBack} className="mb-4">
						<ArrowLeft className="mr-2 h-4 w-4" />
						{"Volver"}
					</Button>

					<Card className="shadow-xl border-0">
						<CardContent className="pt-6">
							<article>
								{article.category && (
									<Badge variant="outline" className="mb-4">
										{article.category.name}
									</Badge>
								)}

								<h1 className="text-4xl font-bold tracking-tight mb-4">
									{article.title}
								</h1>

								<div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
									{article.author && (
										<span className="flex items-center gap-2">
											<User className="h-4 w-4" />
											{article.author.name}
										</span>
									)}
									{article.published_at && (
										<span className="flex items-center gap-2">
											<Calendar className="h-4 w-4" />
											{formatDate(article.published_at)}
										</span>
									)}
									<Button variant="ghost" size="sm" onClick={handleShare}>
										<Share2 className="h-4 w-4 mr-2" />
										{"Compartir"}
									</Button>
								</div>

								{article.tags && article.tags.length > 0 && (
									<div className="flex flex-wrap gap-2 mb-6">
										{article.tags.map((tag) => (
											<Badge key={tag.id} variant="secondary">
												<Tag className="h-3 w-3 mr-1" />
												{tag.name}
											</Badge>
										))}
									</div>
								)}

								{article.cover_url && (
									<div className="mb-8">
										<img
											src={article.cover_url}
											alt={article.title}
											className="w-full h-auto rounded-lg shadow-lg"
										/>
									</div>
								)}

								<div
									className="prose prose-lg dark:prose-invert max-w-none"
									dangerouslySetInnerHTML={{ __html: article.content }}
								/>

								{article.gallery && article.gallery.length > 0 && (
									<div className="mt-12">
										<h2 className="text-2xl font-bold mb-4">
											{"Galería"}
										</h2>
										<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
											{article.gallery.map((image) => (
												<a
													key={image.id}
													href={image.url}
													target="_blank"
													rel="noopener noreferrer"
												>
													<img
														src={image.url}
														alt=""
														className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity"
													/>
												</a>
											))}
										</div>
									</div>
								)}
							</article>
						</CardContent>
					</Card>

					<div className="mt-8 pt-6 border-t">
						<Button asChild variant="outline">
							<Link to="/blog">
								<ArrowLeft className="mr-2 h-4 w-4" />
								{"Volver a la lista de artículos"}
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</PublicLayout>
	);
}
